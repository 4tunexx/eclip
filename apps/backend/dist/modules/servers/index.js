"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServersModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const orchestrator_1 = require("./orchestrator");
const createServersModule = (ctx) => {
    const orchestrator = new orchestrator_1.ServerOrchestrator();
    const service = new service_1.ServersService(ctx, orchestrator);
    service.start();
    const controller = new controller_1.ServersController(service);
    return { controller, service };
};
exports.createServersModule = createServersModule;
//# sourceMappingURL=index.js.map