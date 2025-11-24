import { FastifyInstance, FastifyRequest } from "fastify"
import { AnticheatService } from "./service"

export class AnticheatController {
  constructor(private readonly service: AnticheatService) {}

  registerRoutes(app: FastifyInstance) {
    app.get("/api/anticheat/health", async () => this.service.health())
    app.post("/api/anticheat/log", async (request: FastifyRequest<{ Body: unknown }>) => this.service.ingest(request.body))
  }
}
