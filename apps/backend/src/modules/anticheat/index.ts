import type { AppContext } from "../../context"
import { AnticheatController } from "./controller"
import { AnticheatService } from "./service"

export const createAnticheatModule = (ctx: AppContext) => {
  const service = new AnticheatService(ctx)
  const controller = new AnticheatController(service)
  return { controller, service }
}
