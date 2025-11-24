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
fastify.post("/queue", async (req, reply) => {
    const schema = zod_1.z.object({ userId: zod_1.z.string(), ladder: zod_1.z.enum(["5v5", "1v1"]) });
    const parsed = schema.parse(req.body);
    await bus.publish("matchmaking.queue", { type: "matchmaking.queue.joined", payload: parsed, timestamp: new Date().toISOString() });
    reply.send({ ok: true });
});
bus.subscribe("server.spawn.requested", async (evt) => {
    if (evt.type !== "server.spawn.requested")
        return;
    // placeholder
});
const port = Number(process.env.PORT || 3011);
fastify.listen({ port, host: "0.0.0.0" });
//# sourceMappingURL=index.js.map