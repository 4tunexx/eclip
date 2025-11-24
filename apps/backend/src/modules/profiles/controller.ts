import { FastifyInstance, FastifyRequest } from "fastify"
import { ProfilesService } from "./service"

export class ProfilesController {
  constructor(private readonly service: ProfilesService) {}

  registerRoutes(app: FastifyInstance) {
    app.get("/api/profiles/health", async () => this.service.health())
    app.get(
      "/api/leaderboards",
      async (request: FastifyRequest<{ Querystring: { period?: string } }>) => this.service.getLeaderboards(request.query.period)
    )
  }
}
