import type { AppContext } from "../../context";
import { ServersController } from "./controller";
import { ServersService } from "./service";
export declare const createServersModule: (ctx: AppContext) => {
    controller: ServersController;
    service: ServersService;
};
