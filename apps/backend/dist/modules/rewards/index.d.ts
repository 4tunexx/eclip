import type { AppContext } from "../../context";
import { RewardsController } from "./controller";
import { RewardsService } from "./service";
export declare const createRewardsModule: (ctx: AppContext) => {
    controller: RewardsController;
    service: RewardsService;
};
