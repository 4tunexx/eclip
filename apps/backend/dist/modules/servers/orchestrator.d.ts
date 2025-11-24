export interface SpawnServerParams {
    matchId: string;
    ladder: string;
    teamA: string[];
    teamB: string[];
}
export interface SpawnResult {
    instanceName: string;
    region: string;
    zone: string;
    ip?: string;
    port: number;
}
export declare class ServerOrchestrator {
    private readonly auth;
    private readonly compute;
    spawnServer(params: SpawnServerParams): Promise<SpawnResult>;
    shutdownInstance(instanceName: string): Promise<void>;
    private waitForZoneOperation;
    private getInstanceIp;
    private buildInstanceName;
}
