"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const pg_1 = require("pg");
const bus_1 = require("@eclip/shared/src/bus");
const googleapis_1 = require("googleapis");
const fastify = (0, fastify_1.default)({ logger: true });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const bus = new bus_1.EventBus(process.env.REDIS_URL || "");
fastify.get("/health", async () => ({ ok: true }));
bus.subscribe("server.spawn.requested", async (evt) => {
    if (evt.type !== "server.spawn.requested")
        return;
    const client = await pool.connect();
    try {
        const auth = new googleapis_1.google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GCP_CREDENTIALS_JSON || "{}"), scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
        const compute = googleapis_1.google.compute({ version: "v1", auth });
        const project = process.env.GCP_PROJECT || "";
        const zone = process.env.GCP_ZONE || "us-central1-a";
        const name = `eclip-${Date.now()}`;
        await compute.instances.insert({ project, zone, requestBody: { name, machineType: `zones/${zone}/machineTypes/e2-standard-4`, networkInterfaces: [{ accessConfigs: [{ name: "External NAT", type: "ONE_TO_ONE_NAT" }] }], disks: [{ boot: true, autoDelete: true, initializeParams: { sourceImage: process.env.GCP_IMAGE || "" } }] } });
        const ip = "pending";
        const port = 27015;
        const region = zone;
        const res = await client.query("INSERT INTO server_instances (provider, region, ip, port, status) VALUES ($1, $2, $3, $4, $5) RETURNING id", ["gcp", region, ip, port, "active"]);
        await bus.publish("server.spawned", { type: "server.spawned", payload: { serverInstanceId: res.rows[0].id, matchId: evt.payload.matchId }, timestamp: new Date().toISOString() });
    }
    finally {
        client.release();
    }
});
const port = Number(process.env.PORT || 3012);
fastify.listen({ port, host: "0.0.0.0" });
//# sourceMappingURL=index.js.map