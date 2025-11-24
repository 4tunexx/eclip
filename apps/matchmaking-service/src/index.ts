import Fastify from "fastify"
import { Pool } from "pg"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { EventBus } from "@eclip/shared"

const fastify = Fastify({ logger: true })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const bus = new EventBus(process.env.REDIS_URL || "")

fastify.get("/health", async () => ({ ok: true }))

fastify.post("/queue", async (req, reply) => {
  const schema = z.object({ userId: z.string(), ladder: z.enum(["5v5", "1v1"]) })
  const parsed = schema.parse(req.body as any)
  await bus.publish("matchmaking.queue", { type: "matchmaking.queue.joined", payload: parsed, timestamp: new Date().toISOString() })
  reply.send({ ok: true })
})

bus.subscribe("server.spawn.requested", async (evt) => {
  if (evt.type !== "server.spawn.requested") return
  // placeholder
})

const port = Number(process.env.PORT || 3011)
fastify.listen({ port, host: "0.0.0.0" })