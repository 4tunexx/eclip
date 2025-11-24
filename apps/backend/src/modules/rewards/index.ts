import type { AppContext } from "../../context"
import { RewardsController } from "./controller"
import { RewardsService } from "./service"

export const createRewardsModule = (ctx: AppContext) => {
  const service = new RewardsService(ctx)
  service.start()
  const controller = new RewardsController(service)
  return { controller, service }
}
