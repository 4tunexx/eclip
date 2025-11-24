"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const zod_1 = require("zod");
const logger_1 = require("../../utils/logger");
const steamCallbackSchema = zod_1.z.object({
    steamId: zod_1.z.string().min(1),
    username: zod_1.z.string().min(1),
    avatar: zod_1.z.string().url().optional()
});
class AuthService {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async health() {
        return { module: "auth", status: "ok" };
    }
    async handleSteamCallback(body) {
        const parsed = steamCallbackSchema.parse(body);
        const eclipId = `E-${parsed.steamId}`;
        const client = await this.ctx.db.connect();
        try {
            const result = await client.query(`INSERT INTO users (steam_id, username, avatar, eclip_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (steam_id)
         DO UPDATE SET username = EXCLUDED.username, avatar = EXCLUDED.avatar
         RETURNING id, steam_id, username, eclip_id, created_at`, [parsed.steamId, parsed.username, parsed.avatar ?? null, eclipId]);
            const row = result.rows[0];
            logger_1.logger.info("steam.callback.success", { steamId: parsed.steamId });
            return {
                id: row.id,
                steamId: row.steam_id,
                username: row.username,
                eclipId: row.eclip_id,
                createdAt: row.created_at?.toISOString?.() ?? new Date().toISOString()
            };
        }
        finally {
            client.release();
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map