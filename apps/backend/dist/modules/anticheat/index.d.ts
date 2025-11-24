import type { AppContext } from "../../context";
import { AnticheatController } from "./controller";
import { AnticheatService } from "./service";
export declare const createAnticheatModule: (ctx: AppContext) => {
    controller: AnticheatController;
    service: AnticheatService;
};
