import { z } from "zod"
import type { User } from "@eclip/shared"
import type { AppContext } from "../../context"
import { logger } from "../../utils/logger"

const steamCallbackSchema = z.object({
  steamId: z.string().min(1),
  username: z.string().min(1),
  avatar: z.string().url().optional()
})

export class AuthService {
  constructor(private readonly ctx: AppContext) {}

  async health() {
    return { module: "auth", status: "ok" as const }
  }

  async handleSteamCallback(body: unknown): Promise<User> {
    const parsed = steamCallbackSchema.parse(body)
    const eclipId = `E-${parsed.steamId}`
    const client = await this.ctx.db.connect()
    try {
      const result = await client.query(
        `INSERT INTO users (steam_id, username, avatar, eclip_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (steam_id)
         DO UPDATE SET username = EXCLUDED.username, avatar = EXCLUDED.avatar
         RETURNING id, steam_id, username, eclip_id, created_at`,
        [parsed.steamId, parsed.username, parsed.avatar ?? null, eclipId]
      )
      const row = result.rows[0]
      logger.info("steam.callback.success", { steamId: parsed.steamId })
      return {
        id: row.id,
        steamId: row.steam_id,
        username: row.username,
        eclipId: row.eclip_id,
        createdAt: row.created_at?.toISOString?.() ?? new Date().toISOString()
      }
    } finally {
      client.release()
    }
  }
}
