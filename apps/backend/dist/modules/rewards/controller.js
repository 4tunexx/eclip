"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsController = void 0;
class RewardsController {
    constructor(service) {
        this.service = service;
    }
    registerRoutes(app) {
        app.get("/api/rewards/health", async () => this.service.health());
        app.get("/api/wallets/:userId", async (request) => this.service.getWallet(request.params.userId));
    }
}
exports.RewardsController = RewardsController;
//# sourceMappingURL=controller.js.map