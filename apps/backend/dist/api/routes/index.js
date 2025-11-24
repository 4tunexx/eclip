"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCoreRoutes = void 0;
const registerCoreRoutes = (app) => {
    app.get("/api/healthz", async () => ({ service: "core", status: "ok" }));
};
exports.registerCoreRoutes = registerCoreRoutes;
//# sourceMappingURL=index.js.map