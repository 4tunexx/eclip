import { FastifyInstance } from "fastify";
import { ServersService } from "./service";
export declare class ServersController {
    private readonly service;
    constructor(service: ServersService);
    registerRoutes(app: FastifyInstance): void;
}
