import { FastifyInstance } from "fastify";
import { AuthService } from "./service";
export declare class AuthController {
    private readonly service;
    constructor(service: AuthService);
    registerRoutes(app: FastifyInstance): void;
}
