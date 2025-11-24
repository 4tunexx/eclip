import { FastifyInstance } from "fastify";
import { AnticheatService } from "./service";
export declare class AnticheatController {
    private readonly service;
    constructor(service: AnticheatService);
    registerRoutes(app: FastifyInstance): void;
}
