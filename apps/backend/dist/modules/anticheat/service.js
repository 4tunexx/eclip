"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnticheatService = void 0;
const zod_1 = require("zod");
const logger_1 = require("../../utils/logger");
const logSchema = zod_1.z.object({
    steamId: zod_1.z.string().min(1),
    matchId: zod_1.z.string().min(1).optional(),
    type: zod_1.z.string().min(1),
    severity: zod_1.z.enum(["info", "warn", "critical"]).default("info"),
    details: zod_1.z.record(zod_1.z.any()).optional()
});
class AnticheatService {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async health() {
        return { module: "anticheat", status: "ok" };
    }
    async ingest(body) {
        const parsed = logSchema.parse(body);
        const client = await this.ctx.db.connect();
        try {
            await client.query(`INSERT INTO ac_logs (steamId, match_id, type, details, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`, [parsed.steamId, parsed.matchId ?? null, parsed.type, JSON.stringify({ severity: parsed.severity, details: parsed.details })]);
            await this.ctx.bus.publish("ac.flagged", {
                type: "ac.flagged",
                payload: { steamId: parsed.steamId, severity: parsed.severity, type: parsed.type },
                timestamp: new Date().toISOString()
            });
            logger_1.logger.info("anticheat.log.ingested", { steamId: parsed.steamId, severity: parsed.severity });
            return { ok: true };
        }
        finally {
            client.release();
        }
    }
}
exports.AnticheatService = AnticheatService;
//# sourceMappingURL=service.js.map