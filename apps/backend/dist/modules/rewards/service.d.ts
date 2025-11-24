import type { AppContext } from "../../context";
export declare class RewardsService {
    private readonly ctx;
    constructor(ctx: AppContext);
    start(): void;
    health(): Promise<{
        module: string;
        status: "ok";
    }>;
    getWallet(userId: string): Promise<{
        wallet: {
            id: any;
            balance: number;
        };
        transactions: {
            amount: number;
            type: any;
            reason: any;
            createdAt: any;
        }[];
    }>;
    private handleMatchCompleted;
    private calculateCoins;
    private ensureWallet;
}
