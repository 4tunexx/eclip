"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnticheatModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const createAnticheatModule = (ctx) => {
    const service = new service_1.AnticheatService(ctx);
    const controller = new controller_1.AnticheatController(service);
    return { controller, service };
};
exports.createAnticheatModule = createAnticheatModule;
//# sourceMappingURL=index.js.map