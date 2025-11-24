import { FastifyInstance } from "fastify";
import { RewardsService } from "./service";
export declare class RewardsController {
    private readonly service;
    constructor(service: RewardsService);
    registerRoutes(app: FastifyInstance): void;
}
