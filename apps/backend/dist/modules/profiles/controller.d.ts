import { FastifyInstance } from "fastify";
import { ProfilesService } from "./service";
export declare class ProfilesController {
    private readonly service;
    constructor(service: ProfilesService);
    registerRoutes(app: FastifyInstance): void;
}
