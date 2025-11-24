"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnticheatController = void 0;
class AnticheatController {
    constructor(service) {
        this.service = service;
    }
    registerRoutes(app) {
        app.get("/api/anticheat/health", async () => this.service.health());
        app.post("/api/anticheat/log", async (request) => this.service.ingest(request.body));
    }
}
exports.AnticheatController = AnticheatController;
//# sourceMappingURL=controller.js.map