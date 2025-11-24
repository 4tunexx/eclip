export type EventType = "queue.join" | "queue.pop" | "match.start" | "match.update" | "match.end" | "ac.alert" | "notification";
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
