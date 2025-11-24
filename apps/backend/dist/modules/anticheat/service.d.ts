import type { AppContext } from "../../context";
export declare class AnticheatService {
    private readonly ctx;
    constructor(ctx: AppContext);
    health(): Promise<{
        module: string;
        status: "ok";
    }>;
    ingest(body: unknown): Promise<{
        ok: boolean;
    }>;
}
