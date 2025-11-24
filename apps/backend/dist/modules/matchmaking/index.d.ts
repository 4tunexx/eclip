import type { AppContext } from "../../context";
import { MatchmakingController } from "./controller";
import { MatchmakingService } from "./service";
export declare const createMatchmakingModule: (ctx: AppContext) => {
    controller: MatchmakingController;
    service: MatchmakingService;
};
