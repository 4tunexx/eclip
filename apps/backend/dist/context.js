"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppContext = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const shared_1 = require("@eclip/shared");
const env_1 = require("./config/env");
const client_1 = require("./db/client");
class LocalEventBus {
    constructor() {
        this.listeners = new Map();
    }
    async publish(channel, event) {
        const handlers = this.listeners.get(channel) || [];
        handlers.forEach(handler => {
            try {
                handler(event);
            }
            catch { }
        });
    }
    subscribe(channel, handler) {
        const group = this.listeners.get(channel) || [];
        group.push(handler);
        this.listeners.set(channel, group);
    }
}
const createAppContext = () => {
    const db = (0, client_1.getDb)();
    const redis = env_1.env.REDIS_URL ? new ioredis_1.default(env_1.env.REDIS_URL) : undefined;
    const bus = env_1.env.REDIS_URL ? new shared_1.EventBus(env_1.env.REDIS_URL) : new LocalEventBus();
    return { db, redis, bus };
};
exports.createAppContext = createAppContext;
//# sourceMappingURL=context.js.map