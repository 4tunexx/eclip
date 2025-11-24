import type { AppContext } from "../../context"
import { ServersController } from "./controller"
import { ServersService } from "./service"
import { ServerOrchestrator } from "./orchestrator"

export const createServersModule = (ctx: AppContext) => {
  const orchestrator = new ServerOrchestrator()
  const service = new ServersService(ctx, orchestrator)
  service.start()
  const controller = new ServersController(service)
  return { controller, service }
}
