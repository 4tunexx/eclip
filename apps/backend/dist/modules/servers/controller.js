"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServersController = void 0;
class ServersController {
    constructor(service) {
        this.service = service;
    }
    registerRoutes(app) {
        app.get("/api/servers/health", async () => this.service.health());
        app.post("/api/match/event", async (request) => this.service.handleMatchEvent(request.body));
    }
}
exports.ServersController = ServersController;
//# sourceMappingURL=controller.js.map