import type { AppContext } from "../../context";
import type { LeaderboardEntry } from "@eclip/shared";
export declare class ProfilesService {
    private readonly ctx;
    constructor(ctx: AppContext);
    health(): Promise<{
        module: string;
        status: "ok";
    }>;
    getLeaderboards(periodParam: unknown): Promise<{
        entries: LeaderboardEntry[];
    }>;
}
