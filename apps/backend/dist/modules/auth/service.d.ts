import type { User } from "@eclip/shared";
import type { AppContext } from "../../context";
export declare class AuthService {
    private readonly ctx;
    constructor(ctx: AppContext);
    health(): Promise<{
        module: string;
        status: "ok";
    }>;
    handleSteamCallback(body: unknown): Promise<User>;
}
