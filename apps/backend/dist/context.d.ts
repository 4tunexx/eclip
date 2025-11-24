import Redis from "ioredis";
import type { BusEvent } from "@eclip/shared";
import type { Pool } from "pg";
type EventHandler = (event: BusEvent) => void;
export interface EventBridge {
    publish: <T>(channel: string, event: BusEvent<T>) => Promise<void>;
    subscribe?: (channel: string, handler: EventHandler) => void;
}
export interface AppContext {
    db: Pool;
    redis?: Redis;
    bus: EventBridge;
}
export declare const createAppContext: () => AppContext;
export {};
