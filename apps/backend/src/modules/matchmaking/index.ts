import type { AppContext } from "../../context"
import { MatchmakingController } from "./controller"
import { MatchmakingService } from "./service"

export const createMatchmakingModule = (ctx: AppContext) => {
  const service = new MatchmakingService(ctx)
  service.startProcessing()
  const controller = new MatchmakingController(service)
  return { controller, service }
}
