import { FastifyInstance } from "fastify";
import { MatchmakingService } from "./service";
export declare class MatchmakingController {
    private readonly service;
    constructor(service: MatchmakingService);
    registerRoutes(app: FastifyInstance): void;
}
