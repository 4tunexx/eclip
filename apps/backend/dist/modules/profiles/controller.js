"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesController = void 0;
class ProfilesController {
    constructor(service) {
        this.service = service;
    }
    registerRoutes(app) {
        app.get("/api/profiles/health", async () => this.service.health());
        app.get("/api/leaderboards", async (request) => this.service.getLeaderboards(request.query.period));
    }
}
exports.ProfilesController = ProfilesController;
//# sourceMappingURL=controller.js.map