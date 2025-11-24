"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServersService = void 0;
const zod_1 = require("zod");
const logger_1 = require("../../utils/logger");
const env_1 = require("../../config/env");
const roundWinSchema = zod_1.z.object({
    type: zod_1.z.literal("round_win"),
    payload: zod_1.z.object({
        matchId: zod_1.z.string().min(1),
        team: zod_1.z.string().min(1)
    })
});
const playerStatsSchema = zod_1.z.object({
    type: zod_1.z.literal("player_stats"),
    payload: zod_1.z.object({
        matchId: zod_1.z.string().min(1),
        steamId: zod_1.z.string().min(1),
        kills: zod_1.z.number().nonnegative(),
        deaths: zod_1.z.number().nonnegative(),
        assists: zod_1.z.number().nonnegative().default(0),
        hs: zod_1.z.number().nonnegative().default(0),
        clutch: zod_1.z.number().nonnegative().default(0),
        adr: zod_1.z.number().nonnegative().default(0),
        score: zod_1.z.number().nonnegative().default(0)
    })
});
const matchEndSchema = zod_1.z.object({
    type: zod_1.z.literal("match_end"),
    payload: zod_1.z.object({
        matchId: zod_1.z.string().min(1),
        winnerTeam: zod_1.z.string().min(1),
        winnerTeamPlayers: zod_1.z.array(zod_1.z.string()).optional()
    })
});
class ServersService {
    constructor(ctx, orchestrator) {
        this.ctx = ctx;
        this.orchestrator = orchestrator;
    }
    start() {
        if (this.ctx.bus.subscribe) {
            this.ctx.bus.subscribe("server.spawn.requested", event => {
                const payload = event.payload;
                void this.processSpawnRequest(payload);
            });
        }
        else {
            logger_1.logger.warn("servers.bus.subscribe.unavailable");
        }
    }
    async health() {
        return { module: "servers", status: "ok" };
    }
    async handleMatchEvent(body) {
        const parsed = this.parseEvent(body);
        if (!parsed) {
            return { ok: true };
        }
        if (parsed.type === "round_win") {
            return { ok: true };
        }
        if (parsed.type === "player_stats") {
            await this.persistPlayerStats(parsed.payload);
            return { ok: true };
        }
        await this.completeMatch(parsed.payload);
        return { ok: true };
    }
    parseEvent(body) {
        try {
            if (typeof body !== "object" || body === null) {
                return null;
            }
            if (body.type === "round_win") {
                return roundWinSchema.parse(body);
            }
            if (body.type === "player_stats") {
                return playerStatsSchema.parse(body);
            }
            if (body.type === "match_end") {
                return matchEndSchema.parse(body);
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error("servers.event.parse_failed", { error });
            return null;
        }
    }
    async persistPlayerStats(payload) {
        const client = await this.ctx.db.connect();
        try {
            await client.query(`INSERT INTO match_stats (match_id, steamId, kills, deaths, assists, hs, clutch, adr, score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [payload.matchId, payload.steamId, payload.kills, payload.deaths, payload.assists, payload.hs, payload.clutch, payload.adr, payload.score]);
        }
        finally {
            client.release();
        }
    }
    async completeMatch(payload) {
        const client = await this.ctx.db.connect();
        try {
            await client.query("UPDATE matches SET match_end = NOW(), winner_team = $1, status = 'completed' WHERE id = $2", [payload.winnerTeam, payload.matchId]);
            const statsRes = await client.query("SELECT steamId, kills, deaths, hs, clutch FROM match_stats WHERE match_id = $1", [payload.matchId]);
            const stats = statsRes.rows.map(row => ({
                userId: row.steamid,
                kills: row.kills,
                deaths: row.deaths,
                headshots: row.hs,
                clutches: row.clutch,
                ratingDelta: 0,
                result: payload.winnerTeamPlayers?.includes(row.steamid) ? "win" : "loss",
                mvps: 0
            }));
            await this.ctx.bus.publish("match.completed", {
                type: "match.completed",
                payload: { matchId: payload.matchId, stats },
                timestamp: new Date().toISOString()
            });
            await this.decommissionMatchServer(payload.matchId);
        }
        finally {
            client.release();
        }
    }
    async processSpawnRequest(payload) {
        try {
            const result = await this.orchestrator.spawnServer(payload);
            const client = await this.ctx.db.connect();
            try {
                const serverRes = await client.query(`INSERT INTO server_instances (provider, region, ip, port, status, gcp_instance_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`, ["gcp", env_1.env.GCP_REGION, result.ip ?? "pending", result.port, "active", result.instanceName]);
                const serverInstanceId = serverRes.rows[0].id;
                await client.query("UPDATE matches SET server_instance_id = $1, server_id = $2, status = 'active' WHERE id = $3", [serverInstanceId, result.instanceName, payload.matchId]);
                await this.ctx.bus.publish("server.spawned", {
                    type: "server.spawned",
                    payload: { matchId: payload.matchId, ip: result.ip, port: result.port, instance: result.instanceName },
                    timestamp: new Date().toISOString()
                });
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            logger_1.logger.error("servers.spawn.failed", { error, matchId: payload.matchId });
        }
    }
    async decommissionMatchServer(matchId) {
        const client = await this.ctx.db.connect();
        try {
            const res = await client.query(`SELECT si.gcp_instance_id
         FROM matches m
         LEFT JOIN server_instances si ON si.id = m.server_instance_id
         WHERE m.id = $1`, [matchId]);
            const instanceId = res.rows[0]?.gcp_instance_id;
            if (instanceId) {
                await this.orchestrator.shutdownInstance(instanceId);
                await client.query("UPDATE server_instances SET status = 'stopped' WHERE gcp_instance_id = $1", [instanceId]);
            }
        }
        catch (error) {
            logger_1.logger.error("servers.decommission.failed", { error, matchId });
        }
        finally {
            client.release();
        }
    }
}
exports.ServersService = ServersService;
//# sourceMappingURL=service.js.map