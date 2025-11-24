import { z } from "zod"
import type { AppContext } from "../../context"
import type { LeaderboardEntry } from "@eclip/shared"

const periodSchema = z.enum(["daily", "weekly", "monthly"]).default("daily")

const tableMap: Record<string, string> = {
  daily: "leaderboard_daily",
  weekly: "leaderboard_weekly",
  monthly: "leaderboard_monthly"
}

export class ProfilesService {
  constructor(private readonly ctx: AppContext) {}

  async health() {
    return { module: "profiles", status: "ok" as const }
  }

  async getLeaderboards(periodParam: unknown) {
    const period = periodSchema.parse(periodParam ?? "daily")
    const table = tableMap[period]
    const client = await this.ctx.db.connect()
    try {
      const result = await client.query(
        `SELECT user_id, wins, streak, headshot_ratio, mvps, clutches, rating FROM ${table} ORDER BY rating DESC, wins DESC LIMIT 100`
      )
      const entries: LeaderboardEntry[] = result.rows.map(row => ({
        id: row.user_id,
        userId: row.user_id,
        period,
        wins: row.wins,
        streak: row.streak,
        headshotRatio: row.headshot_ratio,
        mvps: row.mvps,
        clutches: row.clutches,
        rating: row.rating
      }))
      return { entries }
    } finally {
      client.release()
    }
  }
}
