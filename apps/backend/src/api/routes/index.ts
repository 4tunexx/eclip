import { FastifyInstance } from "fastify"

export const registerCoreRoutes = (app: FastifyInstance) => {
  app.get("/api/healthz", async () => ({ service: "core", status: "ok" }))
}
