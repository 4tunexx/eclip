import { AuthController } from './controller'
import { AuthService } from './service'
import type { AppContext } from '../../context'

export const createAuthModule = (ctx: AppContext) => {
  const service = new AuthService(ctx)
  const controller = new AuthController(service)
  return { controller, service }
}
