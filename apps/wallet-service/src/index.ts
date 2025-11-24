import Fastify from "fastify"
import { Pool } from "pg"
import { EventBus } from "@eclip/shared"

const fastify = Fastify({ logger: true })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const bus = new EventBus(process.env.REDIS_URL || "")

fastify.get("/health", async () => ({ ok: true }))

bus.subscribe("match.completed", async (evt) => {
  if (evt.type !== "match.completed") return
  const payload = evt.payload as any
  const client = await pool.connect()
  try {
    for (const s of payload.stats as any[]) {
      const coins = (s.result === "win" ? 10 : 1) + (s.mvps || 0)
      const wRes = await client.query("SELECT id FROM wallets WHERE user_id = $1", [s.userId])
      const walletId = wRes.rows[0]?.id || (await client.query("INSERT INTO wallets (user_id, balance) VALUES ($1, $2) RETURNING id", [s.userId, 0])).rows[0].id
      await client.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [coins, walletId])
      await client.query("INSERT INTO transactions (wallet_id, amount, type, reason) VALUES ($1, $2, $3, $4)", [walletId, coins, "earn", "match result"])
    }
    await bus.publish("wallet.reward", { type: "wallet.reward", payload: { matchId: payload.matchId }, timestamp: new Date().toISOString() })
  } finally {
    client.release()
  }
})

const port = Number(process.env.PORT || 3013)
fastify.listen({ port, host: "0.0.0.0" })