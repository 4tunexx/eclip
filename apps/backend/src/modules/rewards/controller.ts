import { FastifyInstance, FastifyRequest } from "fastify"
import { RewardsService } from "./service"

type WalletParams = {
  Params: {
    userId: string
  }
}

export class RewardsController {
  constructor(private readonly service: RewardsService) {}

  registerRoutes(app: FastifyInstance) {
    app.get("/api/rewards/health", async () => this.service.health())
    app.get(
      "/api/wallets/:userId",
      async (request: FastifyRequest<WalletParams>) => this.service.getWallet(request.params.userId)
    )
  }
}
