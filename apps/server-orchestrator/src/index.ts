import Fastify from "fastify"
import { Pool } from "pg"
import { EventBus } from "@eclip/shared"
import { google } from "googleapis"

const fastify = Fastify({ logger: true })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const bus = new EventBus(process.env.REDIS_URL || "")

fastify.get("/health", async () => ({ ok: true }))

function getAuth() {
  const b64 = process.env.GCP_CREDENTIALS_B64
  const json = process.env.GCP_CREDENTIALS_JSON
  const creds = b64 ? JSON.parse(Buffer.from(b64, "base64").toString("utf8")) : JSON.parse(json || "{}")
  return new google.auth.GoogleAuth({ credentials: creds, scopes: ["https://www.googleapis.com/auth/cloud-platform"] })
}

bus.subscribe("server.spawn.requested", async (evt) => {
  if (evt.type !== "server.spawn.requested") return
  const client = await pool.connect()
  try {
    const auth = getAuth()
    const compute = google.compute({ version: "v1", auth })
    const project = process.env.GCP_PROJECT || ""
    const zone = process.env.GCP_ZONE || "us-central1-a"
    const name = `eclip-${Date.now()}`
    await compute.instances.insert({ project, zone, requestBody: { name, machineType: `zones/${zone}/machineTypes/e2-standard-4`, networkInterfaces: [{ accessConfigs: [{ name: "External NAT", type: "ONE_TO_ONE_NAT" }] }], disks: [{ boot: true, autoDelete: true, initializeParams: { sourceImage: process.env.GCP_IMAGE || "" } }] } })
    const ip = "pending"
    const port = 27015
    const region = zone
    const res = await client.query(
      "INSERT INTO server_instances (provider, region, ip, port, status, gcp_instance_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      ["gcp", region, ip, port, "active", name]
    )
    await bus.publish("server.spawned", { type: "server.spawned", payload: { serverInstanceId: res.rows[0].id, matchId: (evt as any).payload.matchId }, timestamp: new Date().toISOString() })
  } finally {
    client.release()
  }
})

const app = fastify
app.post("/spawn/test", async (req, reply) => {
  const client = await pool.connect()
  try {
    const auth = getAuth()
    const compute = google.compute({ version: "v1", auth })
    const project = process.env.GCP_PROJECT || ""
    const zone = process.env.GCP_ZONE || "us-central1-a"
    const name = `eclip-test-${Date.now()}`
    await compute.instances.insert({ project, zone, requestBody: { name, machineType: `zones/${zone}/machineTypes/e2-standard-4`, networkInterfaces: [{ accessConfigs: [{ name: "External NAT", type: "ONE_TO_ONE_NAT" }] }], disks: [{ boot: true, autoDelete: true, initializeParams: { sourceImage: process.env.GCP_IMAGE || "" } }] } })
    const res = await client.query("INSERT INTO server_instances (provider, region, ip, port, status, gcp_instance_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", ["gcp", zone, "pending", 27015, "active", name])
    reply.send({ serverInstanceId: res.rows[0].id, gcpInstanceId: name })
  } finally {
    client.release()
  }
})

app.post("/stop", async (req, reply) => {
  const body = req.body as any
  const auth = getAuth()
  const compute = google.compute({ version: "v1", auth })
  const project = process.env.GCP_PROJECT || ""
  const zone = process.env.GCP_ZONE || "us-central1-a"
  await compute.instances.stop({ project, zone, instance: body.gcpInstanceId })
  reply.send({ ok: true })
})

app.delete("/delete", async (req, reply) => {
  const body = req.body as any
  const auth = getAuth()
  const compute = google.compute({ version: "v1", auth })
  const project = process.env.GCP_PROJECT || ""
  const zone = process.env.GCP_ZONE || "us-central1-a"
  await compute.instances.delete({ project, zone, instance: body.gcpInstanceId })
  reply.send({ ok: true })
})

const port = Number(process.env.PORT || 3012)
fastify.listen({ port, host: "0.0.0.0" })