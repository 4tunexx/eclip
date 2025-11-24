"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModuleControllers = void 0;
const auth_1 = require("../../modules/auth");
const matchmaking_1 = require("../../modules/matchmaking");
const servers_1 = require("../../modules/servers");
const anticheat_1 = require("../../modules/anticheat");
const profiles_1 = require("../../modules/profiles");
const rewards_1 = require("../../modules/rewards");
const registerModuleControllers = (app, ctx) => {
    const modules = [
        (0, auth_1.createAuthModule)(ctx),
        (0, matchmaking_1.createMatchmakingModule)(ctx),
        (0, servers_1.createServersModule)(ctx),
        (0, anticheat_1.createAnticheatModule)(ctx),
        (0, profiles_1.createProfilesModule)(ctx),
        (0, rewards_1.createRewardsModule)(ctx)
    ];
    modules.forEach(({ controller }) => controller.registerRoutes(app));
};
exports.registerModuleControllers = registerModuleControllers;
//# sourceMappingURL=index.js.map