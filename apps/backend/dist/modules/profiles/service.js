"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesService = void 0;
const zod_1 = require("zod");
const periodSchema = zod_1.z.enum(["daily", "weekly", "monthly"]).default("daily");
const tableMap = {
    daily: "leaderboard_daily",
    weekly: "leaderboard_weekly",
    monthly: "leaderboard_monthly"
};
class ProfilesService {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async health() {
        return { module: "profiles", status: "ok" };
    }
    async getLeaderboards(periodParam) {
        const period = periodSchema.parse(periodParam ?? "daily");
        const table = tableMap[period];
        const client = await this.ctx.db.connect();
        try {
            const result = await client.query(`SELECT user_id, wins, streak, headshot_ratio, mvps, clutches, rating FROM ${table} ORDER BY rating DESC, wins DESC LIMIT 100`);
            const entries = result.rows.map(row => ({
                id: row.user_id,
                userId: row.user_id,
                period,
                wins: row.wins,
                streak: row.streak,
                headshotRatio: row.headshot_ratio,
                mvps: row.mvps,
                clutches: row.clutches,
                rating: row.rating
            }));
            return { entries };
        }
        finally {
            client.release();
        }
    }
}
exports.ProfilesService = ProfilesService;
//# sourceMappingURL=service.js.map