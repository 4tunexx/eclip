"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const pg_1 = require("pg");
const bus_1 = require("@eclip/shared/src/bus");
const fastify = (0, fastify_1.default)({ logger: true });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const bus = new bus_1.EventBus(process.env.REDIS_URL || "");
fastify.get("/health", async () => ({ ok: true }));
bus.subscribe("wallet.reward", async (evt) => {
    if (evt.type !== "wallet.reward")
        return;
    const payload = evt.payload;
    const client = await pool.connect();
    try {
        const stats = await client.query("SELECT user_id, wins, streak, headshot_ratio, mvps, clutches, rating FROM leaderboard_daily");
        // placeholder ensures table touched after rewards
    }
    finally {
        client.release();
    }
});
fastify.get("/daily", async (req, reply) => {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT user_id, wins, streak, headshot_ratio, mvps, clutches, rating FROM leaderboard_daily ORDER BY rating DESC LIMIT 100");
        reply.send({ entries: res.rows });
    }
    finally {
        client.release();
    }
});
const port = Number(process.env.PORT || 3014);
fastify.listen({ port, host: "0.0.0.0" });
//# sourceMappingURL=index.js.map