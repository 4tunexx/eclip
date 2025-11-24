import Fastify from "fastify"
import { Pool } from "pg"
import { z } from "zod"
import { EventBus } from "@eclip/shared"

const fastify = Fastify({ logger: true })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const bus = new EventBus(process.env.REDIS_URL || "")

fastify.get("/health", async () => ({ ok: true }))

fastify.post("/heartbeat", async (req, reply) => {
  const schema = z.object({ userId: z.string(), matchId: z.string(), processes: z.array(z.string()).optional(), overlays: z.array(z.string()).optional(), chat: z.array(z.string()).optional() })
  const hb = schema.parse(req.body as any)
  const client = await pool.connect()
  try {
    const badWords = ["cheat", "hack", "aimbot", "wallhack"]
    const toxicity = (hb.chat || []).reduce((max, c) => {
      const hit = badWords.some(w => c.toLowerCase().includes(w))
      return Math.max(max, hit ? 0.5 : 0)
    }, 0)
    const suspicion = (hb.processes || []).some(p => /cheat|overlay|inject/i.test(p)) ? 70 : 0
    const score = Math.min(100, suspicion + toxicity * 30)
    if (score > 50) {
      await client.query("INSERT INTO ac_flags (user_id, match_id, score, label) VALUES ($1, $2, $3, $4)", [hb.userId, hb.matchId, score, "client_anomaly"])
      await bus.publish("ac.flags", { type: "ac.flagged", payload: { userId: hb.userId, matchId: hb.matchId, score }, timestamp: new Date().toISOString() })
    }
    reply.send({ ok: true })
  } finally {
    client.release()
  }
})

bus.subscribe("match.completed", async (evt) => {
  if (evt.type !== "match.completed") return
  const payload = evt.payload as any
  const client = await pool.connect()
  try {
    for (const s of payload.stats as any[]) {
      const kd = (s.kills || 0) / Math.max(1, s.deaths || 0)
      const hs = (s.headshots || 0) / Math.max(1, s.kills || 1)
      const base = kd * 20 + hs * 30 + (s.clutches || 0) * 10
      const score = Math.min(100, base)
      await client.query("INSERT INTO smurf_scores (user_id, score, last_evaluated) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET score = EXCLUDED.score, last_evaluated = EXCLUDED.last_evaluated", [s.userId, score])
      if (score > 75) {
        await client.query("INSERT INTO ac_flags (user_id, match_id, score, label) VALUES ($1, $2, $3, $4)", [s.userId, payload.matchId, score, "smurf_risk"])
      }
    }
  } finally {
    client.release()
  }
})

const port = Number(process.env.PORT || 3015)
fastify.listen({ port, host: "0.0.0.0" })