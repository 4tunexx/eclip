import { FastifyInstance } from "fastify"
import { createAuthModule } from "../../modules/auth"
import { createMatchmakingModule } from "../../modules/matchmaking"
import { createServersModule } from "../../modules/servers"
import { createAnticheatModule } from "../../modules/anticheat"
import { createProfilesModule } from "../../modules/profiles"
import { createRewardsModule } from "../../modules/rewards"
import type { AppContext } from "../../context"

export const registerModuleControllers = (app: FastifyInstance, ctx: AppContext) => {
  const modules = [
    createAuthModule(ctx),
    createMatchmakingModule(ctx),
    createServersModule(ctx),
    createAnticheatModule(ctx),
    createProfilesModule(ctx),
    createRewardsModule(ctx)
  ]

  modules.forEach(({ controller }) => controller.registerRoutes(app))
}
