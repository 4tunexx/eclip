"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(service) {
        this.service = service;
    }
    registerRoutes(app) {
        app.get("/api/auth/health", async () => this.service.health());
        app.post("/api/auth/steam/callback", async (request) => {
            const user = await this.service.handleSteamCallback(request.body);
            return { user };
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=controller.js.map