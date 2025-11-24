import type { LadderType } from "./types";
export type EventType = "queue.join" | "queue.pop" | "match.start" | "match.update" | "match.end" | "match.completed" | "server.spawn.requested" | "server.spawned" | "ac.alert" | "notification";
export interface EclipEvent<T = unknown> {
    type: EventType;
    payload: T;
    timestamp: string;
}
export interface MatchmakingQueueRequest {
    userId: string;
    ladder: "5v5" | "1v1";
}
export interface MatchUpdatePayload {
    matchId: string;
    stats: {
        userId: string;
        kills: number;
        deaths: number;
        headshots: number;
        mvps: number;
        clutches: number;
    }[];
}
export interface ServerSpawnRequestPayload {
    matchId: string;
    ladder: LadderType;
    teamA: string[];
    teamB: string[];
}
