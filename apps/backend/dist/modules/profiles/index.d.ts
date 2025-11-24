import type { AppContext } from "../../context";
import { ProfilesController } from "./controller";
import { ProfilesService } from "./service";
export declare const createProfilesModule: (ctx: AppContext) => {
    controller: ProfilesController;
    service: ProfilesService;
};
