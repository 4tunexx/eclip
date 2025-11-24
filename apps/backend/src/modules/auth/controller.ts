import { FastifyInstance, FastifyRequest } from "fastify"
import { AuthService } from "./service"

export class AuthController {
  constructor(private readonly service: AuthService) {}

  registerRoutes(app: FastifyInstance) {
    app.get("/api/auth/health", async () => this.service.health())

    app.post("/api/auth/steam/callback", async (request: FastifyRequest<{ Body: unknown }>) => {
      const user = await this.service.handleSteamCallback(request.body)
      return { user }
    })
  }
}
