import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { env } from "./config/env"
import { registerCoreRoutes } from "./api/routes"
import { registerModuleControllers } from "./api/controllers"
import { createAppContext } from "./context"
import { logger } from "./utils/logger"

const start = async () => {
  const app = Fastify({ logger: false })
  await app.register(websocket)

  const ctx = createAppContext()

  registerCoreRoutes(app)
  registerModuleControllers(app, ctx)

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" })
    logger.info("backend.started", { port: env.PORT })
  } catch (error) {
    logger.error("backend.start.failed", { error })
    process.exit(1)
  }
}

void start()
