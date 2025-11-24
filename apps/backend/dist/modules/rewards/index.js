"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRewardsModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const createRewardsModule = (ctx) => {
    const service = new service_1.RewardsService(ctx);
    service.start();
    const controller = new controller_1.RewardsController(service);
    return { controller, service };
};
exports.createRewardsModule = createRewardsModule;
//# sourceMappingURL=index.js.map