import { z } from "zod"
import type { ServerSpawnRequestPayload } from "@eclip/shared"
import type { AppContext } from "../../context"
import { logger } from "../../utils/logger"
import { ServerOrchestrator } from "./orchestrator"
import { env } from "../../config/env"

const roundWinSchema = z.object({
  type: z.literal("round_win"),
  payload: z.object({
    matchId: z.string().min(1),
    team: z.string().min(1)
  })
})

const playerStatsSchema = z.object({
  type: z.literal("player_stats"),
  payload: z.object({
    matchId: z.string().min(1),
    steamId: z.string().min(1),
    kills: z.number().nonnegative(),
    deaths: z.number().nonnegative(),
    assists: z.number().nonnegative().default(0),
    hs: z.number().nonnegative().default(0),
    clutch: z.number().nonnegative().default(0),
    adr: z.number().nonnegative().default(0),
    score: z.number().nonnegative().default(0)
  })
})

const matchEndSchema = z.object({
  type: z.literal("match_end"),
  payload: z.object({
    matchId: z.string().min(1),
    winnerTeam: z.string().min(1),
    winnerTeamPlayers: z.array(z.string()).optional()
  })
})

type MatchEvent = z.infer<typeof roundWinSchema> | z.infer<typeof playerStatsSchema> | z.infer<typeof matchEndSchema>

export class ServersService {
  constructor(private readonly ctx: AppContext, private readonly orchestrator: ServerOrchestrator) {}

  start() {
    if (this.ctx.bus.subscribe) {
      this.ctx.bus.subscribe("server.spawn.requested", event => {
        const payload = event.payload as ServerSpawnRequestPayload
        void this.processSpawnRequest(payload)
      })
    } else {
      logger.warn("servers.bus.subscribe.unavailable")
    }
  }

  async health() {
    return { module: "servers", status: "ok" as const }
  }

  async handleMatchEvent(body: unknown) {
    const parsed = this.parseEvent(body)
    if (!parsed) {
      return { ok: true }
    }

    if (parsed.type === "round_win") {
      return { ok: true }
    }

    if (parsed.type === "player_stats") {
      await this.persistPlayerStats(parsed.payload)
      return { ok: true }
    }

    await this.completeMatch(parsed.payload)
    return { ok: true }
  }

  private parseEvent(body: unknown): MatchEvent | null {
    try {
      if (typeof body !== "object" || body === null) {
        return null
      }
      if ((body as { type?: string }).type === "round_win") {
        return roundWinSchema.parse(body)
      }
      if ((body as { type?: string }).type === "player_stats") {
        return playerStatsSchema.parse(body)
      }
      if ((body as { type?: string }).type === "match_end") {
        return matchEndSchema.parse(body)
      }
      return null
    } catch (error) {
      logger.error("servers.event.parse_failed", { error })
      return null
    }
  }

  private async persistPlayerStats(payload: z.infer<typeof playerStatsSchema>["payload"]) {
    const client = await this.ctx.db.connect()
    try {
      await client.query(
        `INSERT INTO match_stats (match_id, steamId, kills, deaths, assists, hs, clutch, adr, score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [payload.matchId, payload.steamId, payload.kills, payload.deaths, payload.assists, payload.hs, payload.clutch, payload.adr, payload.score]
      )
    } finally {
      client.release()
    }
  }

  private async completeMatch(payload: z.infer<typeof matchEndSchema>["payload"]) {
    const client = await this.ctx.db.connect()
    try {
      await client.query(
        "UPDATE matches SET match_end = NOW(), winner_team = $1, status = 'completed' WHERE id = $2",
        [payload.winnerTeam, payload.matchId]
      )
      const statsRes = await client.query("SELECT steamId, kills, deaths, hs, clutch FROM match_stats WHERE match_id = $1", [payload.matchId])
      const stats = statsRes.rows.map(row => ({
        userId: row.steamid,
        kills: row.kills,
        deaths: row.deaths,
        headshots: row.hs,
        clutches: row.clutch,
        ratingDelta: 0,
        result: payload.winnerTeamPlayers?.includes(row.steamid) ? "win" : "loss",
        mvps: 0
      }))
      await this.ctx.bus.publish("match.completed", {
        type: "match.completed",
        payload: { matchId: payload.matchId, stats },
        timestamp: new Date().toISOString()
      })
      await this.decommissionMatchServer(payload.matchId)
    } finally {
      client.release()
    }
  }

  private async processSpawnRequest(payload: ServerSpawnRequestPayload) {
    try {
      const result = await this.orchestrator.spawnServer(payload)
      const client = await this.ctx.db.connect()
      try {
        const serverRes = await client.query(
          `INSERT INTO server_instances (provider, region, ip, port, status, gcp_instance_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          ["gcp", env.GCP_REGION, result.ip ?? "pending", result.port, "active", result.instanceName]
        )
        const serverInstanceId = serverRes.rows[0].id
        await client.query(
          "UPDATE matches SET server_instance_id = $1, server_id = $2, status = 'active' WHERE id = $3",
          [serverInstanceId, result.instanceName, payload.matchId]
        )
        await this.ctx.bus.publish("server.spawned", {
          type: "server.spawned",
          payload: { matchId: payload.matchId, ip: result.ip, port: result.port, instance: result.instanceName },
          timestamp: new Date().toISOString()
        })
      } finally {
        client.release()
      }
    } catch (error) {
      logger.error("servers.spawn.failed", { error, matchId: payload.matchId })
    }
  }

  private async decommissionMatchServer(matchId: string) {
    const client = await this.ctx.db.connect()
    try {
      const res = await client.query(
        `SELECT si.gcp_instance_id
         FROM matches m
         LEFT JOIN server_instances si ON si.id = m.server_instance_id
         WHERE m.id = $1`,
        [matchId]
      )
      const instanceId = res.rows[0]?.gcp_instance_id
      if (instanceId) {
        await this.orchestrator.shutdownInstance(instanceId)
        await client.query("UPDATE server_instances SET status = 'stopped' WHERE gcp_instance_id = $1", [instanceId])
      }
    } catch (error) {
      logger.error("servers.decommission.failed", { error, matchId })
    } finally {
      client.release()
    }
  }
}
