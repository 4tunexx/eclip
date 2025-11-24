import { FastifyInstance, FastifyRequest } from "fastify"
import type { RawData } from "ws"
import { MatchmakingService } from "./service"

export class MatchmakingController {
  constructor(private readonly service: MatchmakingService) {}

  registerRoutes(app: FastifyInstance) {
    app.get("/api/matchmaking/health", async () => this.service.health())

    const queueHandler = async (request: FastifyRequest<{ Body: unknown }>) => this.service.enqueue(request.body)
    app.post("/api/matchmaking/queue", queueHandler)
    app.post("/queue", queueHandler)

    app.post("/api/matches/report", async (request: FastifyRequest<{ Body: unknown }>) => this.service.reportMatch(request.body))

    const registerRealtime = (path: string) => {
      app.get(path, { websocket: true }, connection => {
        connection.socket.on("message", (raw: RawData) => {
          void this.service.handleRealtimePayload(raw.toString())
        })
      })
    }

    registerRealtime("/api/realtime")
    registerRealtime("/realtime")
  }
}
