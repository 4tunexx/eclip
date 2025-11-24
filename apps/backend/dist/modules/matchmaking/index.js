"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchmakingModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const createMatchmakingModule = (ctx) => {
    const service = new service_1.MatchmakingService(ctx);
    service.startProcessing();
    const controller = new controller_1.MatchmakingController(service);
    return { controller, service };
};
exports.createMatchmakingModule = createMatchmakingModule;
//# sourceMappingURL=index.js.map