"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const env_1 = require("./config/env");
const routes_1 = require("./api/routes");
const controllers_1 = require("./api/controllers");
const context_1 = require("./context");
const logger_1 = require("./utils/logger");
const start = async () => {
    const app = (0, fastify_1.default)({ logger: false });
    await app.register(websocket_1.default);
    const ctx = (0, context_1.createAppContext)();
    (0, routes_1.registerCoreRoutes)(app);
    (0, controllers_1.registerModuleControllers)(app, ctx);
    try {
        await app.listen({ port: env_1.env.PORT, host: "0.0.0.0" });
        logger_1.logger.info("backend.started", { port: env_1.env.PORT });
    }
    catch (error) {
        logger_1.logger.error("backend.start.failed", { error });
        process.exit(1);
    }
};
void start();
//# sourceMappingURL=index.js.map