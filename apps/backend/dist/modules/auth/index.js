"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const createAuthModule = (ctx) => {
    const service = new service_1.AuthService(ctx);
    const controller = new controller_1.AuthController(service);
    return { controller, service };
};
exports.createAuthModule = createAuthModule;
//# sourceMappingURL=index.js.map