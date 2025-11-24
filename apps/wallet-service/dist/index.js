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
bus.subscribe("match.completed", async (evt) => {
    if (evt.type !== "match.completed")
        return;
    const payload = evt.payload;
    const client = await pool.connect();
    try {
        for (const s of payload.stats) {
            const coins = (s.result === "win" ? 10 : 1) + (s.mvps || 0);
            const wRes = await client.query("SELECT id FROM wallets WHERE user_id = $1", [s.userId]);
            const walletId = wRes.rows[0]?.id || (await client.query("INSERT INTO wallets (user_id, balance) VALUES ($1, $2) RETURNING id", [s.userId, 0])).rows[0].id;
            await client.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [coins, walletId]);
            await client.query("INSERT INTO transactions (wallet_id, amount, type, reason) VALUES ($1, $2, $3, $4)", [walletId, coins, "earn", "match result"]);
        }
        await bus.publish("wallet.reward", { type: "wallet.reward", payload: { matchId: payload.matchId }, timestamp: new Date().toISOString() });
    }
    finally {
        client.release();
    }
});
const port = Number(process.env.PORT || 3013);
fastify.listen({ port, host: "0.0.0.0" });
//# sourceMappingURL=index.js.map