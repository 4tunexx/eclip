import { FastifyInstance, FastifyRequest } from "fastify"
import { ServersService } from "./service"

export class ServersController {
  constructor(private readonly service: ServersService) {}

  registerRoutes(app: FastifyInstance) {
    app.get("/api/servers/health", async () => this.service.health())
    app.post("/api/match/event", async (request: FastifyRequest<{ Body: unknown }>) => this.service.handleMatchEvent(request.body))
  }
}
