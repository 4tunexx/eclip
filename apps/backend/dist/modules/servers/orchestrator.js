"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerOrchestrator = void 0;
const googleapis_1 = require("googleapis");
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const scopes = ["https://www.googleapis.com/auth/cloud-platform"];
class ServerOrchestrator {
    constructor() {
        this.auth = new googleapis_1.google.auth.GoogleAuth({ scopes });
        this.compute = new googleapis_1.compute_v1.Compute({ auth: this.auth });
    }
    async spawnServer(params) {
        const name = this.buildInstanceName(params.matchId);
        const response = await this.compute.instances.insert({
            project: env_1.env.GCP_PROJECT_ID,
            zone: env_1.env.GCP_COMPUTE_ZONE,
            sourceInstanceTemplate: `projects/${env_1.env.GCP_PROJECT_ID}/global/instanceTemplates/${env_1.env.GCP_COMPUTE_INSTANCE_TEMPLATE}`,
            requestBody: {
                name,
                labels: {
                    match_id: params.matchId.replace(/[^a-z0-9-]/gi, "").toLowerCase(),
                    ladder: params.ladder,
                    region: env_1.env.MATCH_REGION
                },
                metadata: {
                    items: [
                        { key: "match_id", value: params.matchId },
                        { key: "team_a", value: params.teamA.join(",") },
                        { key: "team_b", value: params.teamB.join(",") }
                    ]
                }
            }
        });
        const operationName = response.data.name;
        if (!operationName) {
            throw new Error("GCE_OPERATION_ID_MISSING");
        }
        await this.waitForZoneOperation(operationName);
        const ip = await this.getInstanceIp(name);
        logger_1.logger.info("orchestrator.spawn.success", { instance: name, matchId: params.matchId });
        return {
            instanceName: name,
            region: env_1.env.GCP_REGION,
            zone: env_1.env.GCP_COMPUTE_ZONE,
            ip,
            port: env_1.env.MATCH_SERVER_PORT
        };
    }
    async shutdownInstance(instanceName) {
        const response = await this.compute.instances.delete({
            project: env_1.env.GCP_PROJECT_ID,
            zone: env_1.env.GCP_COMPUTE_ZONE,
            instance: instanceName
        });
        const operationName = response.data.name;
        if (operationName) {
            await this.waitForZoneOperation(operationName);
        }
        logger_1.logger.info("orchestrator.instance.deleted", { instance: instanceName });
    }
    async waitForZoneOperation(operationName) {
        const end = Date.now() + env_1.env.MATCH_SERVER_STARTUP_TIMEOUT;
        while (Date.now() < end) {
            const res = await this.compute.zoneOperations.get({
                project: env_1.env.GCP_PROJECT_ID,
                zone: env_1.env.GCP_COMPUTE_ZONE,
                operation: operationName
            });
            const status = res.data.status;
            if (status === "DONE") {
                if (res.data.error) {
                    throw new Error(JSON.stringify(res.data.error));
                }
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        throw new Error("MATCH_SERVER_START_TIMEOUT");
    }
    async getInstanceIp(instanceName) {
        const instance = await this.compute.instances.get({
            project: env_1.env.GCP_PROJECT_ID,
            zone: env_1.env.GCP_COMPUTE_ZONE,
            instance: instanceName
        });
        const nic = instance.data.networkInterfaces?.[0];
        const accessConfig = nic?.accessConfigs?.[0];
        return accessConfig?.natIP || undefined;
    }
    buildInstanceName(matchId) {
        const suffix = Math.random().toString(36).substring(2, 7);
        return `eclip-${matchId.substring(0, 8)}-${suffix}`.toLowerCase();
    }
}
exports.ServerOrchestrator = ServerOrchestrator;
//# sourceMappingURL=orchestrator.js.map