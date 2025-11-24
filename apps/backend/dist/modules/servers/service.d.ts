import type { AppContext } from "../../context";
import { ServerOrchestrator } from "./orchestrator";
export declare class ServersService {
    private readonly ctx;
    private readonly orchestrator;
    constructor(ctx: AppContext, orchestrator: ServerOrchestrator);
    start(): void;
    health(): Promise<{
        module: string;
        status: "ok";
    }>;
    handleMatchEvent(body: unknown): Promise<{
        ok: boolean;
    }>;
    private parseEvent;
    private persistPlayerStats;
    private completeMatch;
    private processSpawnRequest;
    private decommissionMatchServer;
}
