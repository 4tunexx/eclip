"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingController = void 0;
class MatchmakingController {
    constructor(service) {
        this.service = service;
    }
    registerRoutes(app) {
        app.get("/api/matchmaking/health", async () => this.service.health());
        const queueHandler = async (request) => this.service.enqueue(request.body);
        app.post("/api/matchmaking/queue", queueHandler);
        app.post("/queue", queueHandler);
        app.post("/api/matches/report", async (request) => this.service.reportMatch(request.body));
        const registerRealtime = (path) => {
            app.get(path, { websocket: true }, connection => {
                connection.socket.on("message", (raw) => {
                    void this.service.handleRealtimePayload(raw.toString());
                });
            });
        };
        registerRealtime("/api/realtime");
        registerRealtime("/realtime");
    }
}
exports.MatchmakingController = MatchmakingController;
//# sourceMappingURL=controller.js.map