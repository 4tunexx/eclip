"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfilesModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const createProfilesModule = (ctx) => {
    const service = new service_1.ProfilesService(ctx);
    const controller = new controller_1.ProfilesController(service);
    return { controller, service };
};
exports.createProfilesModule = createProfilesModule;
//# sourceMappingURL=index.js.map