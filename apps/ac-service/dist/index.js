"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const pg_1 = require("pg");
const zod_1 = require("zod");
const bus_1 = require("@eclip/shared/src/bus");
const fastify = (0, fastify_1.default)({ logger: true });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const bus = new bus_1.EventBus(process.env.REDIS_URL || "");
fastify.get("/health", async () => ({ ok: true }));
fastify.post("/heartbeat", async (req, reply) => {
    const schema = zod_1.z.object({ userId: zod_1.z.string(), matchId: zod_1.z.string(), processes: zod_1.z.array(zod_1.z.string()).optional(), overlays: zod_1.z.array(zod_1.z.string()).optional(), chat: zod_1.z.array(zod_1.z.string()).optional() });
    const hb = schema.parse(req.body);
    const client = await pool.connect();
    try {
        const badWords = ["cheat", "hack", "aimbot", "wallhack"];
        const toxicity = (hb.chat || []).reduce((max, c) => {
            const hit = badWords.some(w => c.toLowerCase().includes(w));
            return Math.max(max, hit ? 0.5 : 0);
        }, 0);
        const suspicion = (hb.processes || []).some(p => /cheat|overlay|inject/i.test(p)) ? 70 : 0;
        const score = Math.min(100, suspicion + toxicity * 30);
        if (score > 50) {
            await client.query("INSERT INTO ac_flags (user_id, match_id, score, label) VALUES ($1, $2, $3, $4)", [hb.userId, hb.matchId, score, "client_anomaly"]);
            await bus.publish("ac.flags", { type: "ac.flagged", payload: { userId: hb.userId, matchId: hb.matchId, score }, timestamp: new Date().toISOString() });
        }
        reply.send({ ok: true });
    }
    finally {
        client.release();
    }
});
bus.subscribe("match.completed", async (evt) => {
    if (evt.type !== "match.completed")
        return;
    const payload = evt.payload;
    const client = await pool.connect();
    try {
        for (const s of payload.stats) {
            const kd = (s.kills || 0) / Math.max(1, s.deaths || 0);
            const hs = (s.headshots || 0) / Math.max(1, s.kills || 1);
            const base = kd * 20 + hs * 30 + (s.clutches || 0) * 10;
            const score = Math.min(100, base);
            await client.query("INSERT INTO smurf_scores (user_id, score, last_evaluated) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET score = EXCLUDED.score, last_evaluated = EXCLUDED.last_evaluated", [s.userId, score]);
            if (score > 75) {
                await client.query("INSERT INTO ac_flags (user_id, match_id, score, label) VALUES ($1, $2, $3, $4)", [s.userId, payload.matchId, score, "smurf_risk"]);
            }
        }
    }
    finally {
        client.release();
    }
});
const port = Number(process.env.PORT || 3015);
fastify.listen({ port, host: "0.0.0.0" });
//# sourceMappingURL=index.js.map