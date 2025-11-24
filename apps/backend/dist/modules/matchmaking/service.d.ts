import type { AppContext } from "../../context";
export declare class MatchmakingService {
    private readonly ctx;
    private readonly memoryQueue;
    private processingInterval?;
    constructor(ctx: AppContext);
    health(): Promise<{
        module: string;
        status: "ok";
    }>;
    startProcessing(): void;
    enqueue(body: unknown): Promise<{
        ticketId: string;
    }>;
    reportMatch(body: unknown): Promise<{
        ok: boolean;
    }>;
    handleRealtimePayload(raw: string): Promise<void>;
    private persistRealtimeStats;
    private processQueue;
    private peekQueue;
    private dropEntries;
    private queueKey;
}
