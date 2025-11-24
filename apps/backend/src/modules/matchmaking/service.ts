import { randomUUID } from "crypto"
import { z } from "zod"
import type { MatchUpdatePayload, ServerSpawnRequestPayload } from "@eclip/shared"
import type { AppContext } from "../../context"
import { env } from "../../config/env"
import { logger } from "../../utils/logger"
import type { Ladder } from "../../types"

const queueRequestSchema = z.object({
  userId: z.string().min(1),
  ladder: z.enum(["5v5", "1v1"]).default(env.DEFAULT_QUEUE as Ladder)
})

const matchReportSchema = z.object({
  matchId: z.string().min(1),
  stats: z.array(
    z.object({
      userId: z.string().min(1),
      kills: z.number().nonnegative(),
      deaths: z.number().nonnegative(),
      headshots: z.number().nonnegative(),
      mvps: z.number().nonnegative(),
      clutches: z.number().nonnegative(),
      ratingDelta: z.number()
    })
  )
})

type QueueEntry = {
  ticketId: string
  userId: string
  steamId: string
  ladder: Ladder
  rp: number
  createdAt: string
  raw?: string
}

export class MatchmakingService {
  private readonly memoryQueue: QueueEntry[] = []
  private processingInterval?: NodeJS.Timeout

  constructor(private readonly ctx: AppContext) {}

  async health() {
    return { module: "matchmaking", status: "ok" as const }
  }

  startProcessing() {
    if (this.processingInterval) return
    this.processingInterval = setInterval(() => {
      void this.processQueue(env.DEFAULT_QUEUE as Ladder)
    }, 3000)
  }

  async enqueue(body: unknown) {
    const parsed = queueRequestSchema.parse(body)
    const client = await this.ctx.db.connect()
    try {
      const result = await client.query("SELECT id, steam_id, rank_points FROM users WHERE id = $1", [parsed.userId])
      if (result.rowCount === 0) {
        throw new Error("USER_NOT_FOUND")
      }
      const row = result.rows[0]
      const entry: QueueEntry = {
        ticketId: randomUUID(),
        userId: row.id,
        steamId: row.steam_id || row.id,
        ladder: parsed.ladder,
        rp: row.rank_points || 1000,
        createdAt: new Date().toISOString()
      }
      if (this.ctx.redis) {
        const serialized = JSON.stringify(entry)
        entry.raw = serialized
        await this.ctx.redis.zadd(this.queueKey(parsed.ladder), entry.rp, serialized)
      } else {
        this.memoryQueue.push(entry)
      }
      await this.ctx.bus.publish("matchmaking.queue.joined", {
        type: "matchmaking.queue.joined",
        payload: { ticketId: entry.ticketId, userId: entry.userId, ladder: parsed.ladder },
        timestamp: new Date().toISOString()
      })
      return { ticketId: entry.ticketId }
    } finally {
      client.release()
    }
  }

  async reportMatch(body: unknown) {
    const parsed = matchReportSchema.parse(body)
    const client = await this.ctx.db.connect()
    try {
      for (const stat of parsed.stats) {
        await client.query(
          `INSERT INTO match_stats (match_id, user_id, kills, deaths, headshots, mvps, clutches, rating_delta)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [parsed.matchId, stat.userId, stat.kills, stat.deaths, stat.headshots, stat.mvps, stat.clutches, stat.ratingDelta]
        )
      }
      await client.query("UPDATE matches SET status = 'completed', ended_at = NOW() WHERE id = $1", [parsed.matchId])
      await this.ctx.bus.publish("match.completed", {
        type: "match.completed",
        payload: parsed,
        timestamp: new Date().toISOString()
      })
      return { ok: true }
    } finally {
      client.release()
    }
  }

  async handleRealtimePayload(raw: string) {
    try {
      const event = JSON.parse(raw) as { type?: string; payload?: MatchUpdatePayload }
      if (event.type !== "match.update" || !event.payload) {
        return
      }
      await this.persistRealtimeStats(event.payload)
    } catch (error) {
      logger.error("matchmaking.realtime.parse_failed", { error })
    }
  }

  private async persistRealtimeStats(payload: MatchUpdatePayload) {
    const client = await this.ctx.db.connect()
    try {
      for (const stat of payload.stats) {
        await client.query(
          `INSERT INTO match_stats (match_id, user_id, kills, deaths, headshots, mvps, clutches)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [payload.matchId, stat.userId, stat.kills, stat.deaths, stat.headshots, stat.mvps, stat.clutches]
        )
      }
    } finally {
      client.release()
    }
  }

  private async processQueue(ladder: Ladder) {
    const teamSize = ladder === "5v5" ? 5 : 1
    const needed = teamSize * 2
    const entries = await this.peekQueue(ladder, needed)
    if (entries.length < needed) return
    await this.dropEntries(ladder, entries)
    const teamA = entries.slice(0, teamSize).map(player => player.steamId)
    const teamB = entries.slice(teamSize, needed).map(player => player.steamId)

    const client = await this.ctx.db.connect()
    try {
      const result = await client.query(
        `INSERT INTO matches (ladder, team_a_players, team_b_players, status, match_start)
         VALUES ($1, $2, $3, 'active', NOW()) RETURNING id`,
        [ladder, teamA, teamB]
      )
      const matchId = result.rows[0].id
      const payload: ServerSpawnRequestPayload = { matchId, ladder, teamA, teamB }
      await this.ctx.bus.publish("server.spawn.requested", {
        type: "server.spawn.requested",
        payload,
        timestamp: new Date().toISOString()
      })
      logger.info("matchmaking.match.created", { matchId, ladder })
    } finally {
      client.release()
    }
  }

  private async peekQueue(ladder: Ladder, limit: number): Promise<QueueEntry[]> {
    if (this.ctx.redis) {
      const rawEntries = await this.ctx.redis.zrange(this.queueKey(ladder), 0, limit - 1)
      return rawEntries.map(raw => ({ ...(JSON.parse(raw) as QueueEntry), raw }))
    }
    return this.memoryQueue
      .filter(entry => entry.ladder === ladder)
      .sort((a, b) => b.rp - a.rp)
      .slice(0, limit)
      .map(entry => ({ ...entry }))
  }

  private async dropEntries(ladder: Ladder, entries: QueueEntry[]) {
    if (!entries.length) return
    if (this.ctx.redis) {
      const rawEntries = entries.map(entry => entry.raw).filter((raw): raw is string => Boolean(raw))
      if (rawEntries.length) {
        await this.ctx.redis.zrem(this.queueKey(ladder), ...rawEntries)
      }
      return
    }
    const ticketIds = new Set(entries.map(entry => entry.ticketId))
    for (let i = this.memoryQueue.length - 1; i >= 0; i -= 1) {
      if (this.memoryQueue[i].ladder === ladder && ticketIds.has(this.memoryQueue[i].ticketId)) {
        this.memoryQueue.splice(i, 1)
      }
    }
  }

  private queueKey(ladder: Ladder) {
    return `mm:${ladder}`
  }
}
