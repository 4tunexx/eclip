import type { AppContext } from "../../context"
import { ProfilesController } from "./controller"
import { ProfilesService } from "./service"

export const createProfilesModule = (ctx: AppContext) => {
  const service = new ProfilesService(ctx)
  const controller = new ProfilesController(service)
  return { controller, service }
}
