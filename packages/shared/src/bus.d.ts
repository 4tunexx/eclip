import Redis from "ioredis";
export type BusEventType = "user.login" | "matchmaking.queue.joined" | "server.spawn.requested" | "server.spawned" | "match.completed" | "wallet.reward" | "leaderboard.update" | "ac.flagged" | "smurf.score.update";
export interface BusEvent<T = unknown> {
    type: BusEventType;
    payload: T;
    timestamp: string;
}
export declare class EventBus {
    pub: Redis;
    sub: Redis;
    constructor(url: string);
    publish<T>(channel: string, event: BusEvent<T>): Promise<void>;
    subscribe(channel: string, handler: (event: BusEvent) => void): void;
}
