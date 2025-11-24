import Fastify from "fastify"
import { Pool } from "pg"
import { EventBus } from "@eclip/shared"

const fastify = Fastify({ logger: true })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const bus = new EventBus(process.env.REDIS_URL || "")

fastify.get("/health", async () => ({ ok: true }))

bus.subscribe("wallet.reward", async (evt) => {
  if (evt.type !== "wallet.reward") return
  const payload = evt.payload as any
  const client = await pool.connect()
  try {
    const stats = await client.query("SELECT user_id, wins, streak, headshot_ratio, mvps, clutches, rating FROM leaderboard_daily")
    // placeholder ensures table touched after rewards
  } finally {
    client.release()
  }
})

fastify.get("/daily", async (req, reply) => {
  const client = await pool.connect()
  try {
    const res = await client.query("SELECT user_id, wins, streak, headshot_ratio, mvps, clutches, rating FROM leaderboard_daily ORDER BY rating DESC LIMIT 100")
    reply.send({ entries: res.rows })
  } finally {
    client.release()
  }
})

const port = Number(process.env.PORT || 3014)
fastify.listen({ port, host: "0.0.0.0" })