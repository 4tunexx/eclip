import { z } from "zod"
import type { AppContext } from "../../context"
import { logger } from "../../utils/logger"

const logSchema = z.object({
  steamId: z.string().min(1),
  matchId: z.string().min(1).optional(),
  type: z.string().min(1),
  severity: z.enum(["info", "warn", "critical"]).default("info"),
  details: z.record(z.any()).optional()
})

export class AnticheatService {
  constructor(private readonly ctx: AppContext) {}

  async health() {
    return { module: "anticheat", status: "ok" as const }
  }

  async ingest(body: unknown) {
    const parsed = logSchema.parse(body)
    const client = await this.ctx.db.connect()
    try {
      await client.query(
        `INSERT INTO ac_logs (steamId, match_id, type, details, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [parsed.steamId, parsed.matchId ?? null, parsed.type, JSON.stringify({ severity: parsed.severity, details: parsed.details })]
      )
      await this.ctx.bus.publish("ac.flagged", {
        type: "ac.flagged",
        payload: { steamId: parsed.steamId, severity: parsed.severity, type: parsed.type },
        timestamp: new Date().toISOString()
      })
      logger.info("anticheat.log.ingested", { steamId: parsed.steamId, severity: parsed.severity })
      return { ok: true }
    } finally {
      client.release()
    }
  }
}
