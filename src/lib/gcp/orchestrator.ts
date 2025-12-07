// GCP Server Orchestrator for CS2 Match Servers
// This handles spinning up and shutting down CS2 game servers on Google Cloud

import { config } from '../config';
import { db } from '../db';
import { matches } from '../db/schema';
import { eq } from 'drizzle-orm';

interface MatchServerConfig {
  matchId: string;
  map: string;
  region: string;
  players: Array<{
    steamId: string;
    team: number;
  }>;
}

interface ServerInstance {
  instanceName: string;
  host: string;
  port: number;
  createdAt: Date;
}

// In-memory server registry (in production, would use database)
const serverRegistry = new Map<string, ServerInstance>();

export class MatchServerOrchestrator {
  private projectId: string;
  private zone: string;
  private template: string;
  private isProduction: boolean;

  constructor() {
    this.projectId = config.gcp.projectId;
    this.zone = config.gcp.zone;
    this.template = config.gcp.computeInstanceTemplate;
    this.isProduction = process.env.NODE_ENV === 'production';

    if (!this.projectId || !this.template) {
      console.warn('GCP configuration incomplete, server orchestration will not work in production');
    }
  }

  async createServer(matchConfig: MatchServerConfig): Promise<{ host: string; port: number }> {
    const instanceName = `cs2-match-${matchConfig.matchId.slice(0, 8)}`;
    
    try {
      if (this.isProduction && this.projectId && this.template) {
        // Production: Use actual GCP Compute Engine API
        return await this._createGCPInstance(instanceName, matchConfig);
      } else {
        // Development: Use local server simulation
        return this._createLocalInstance(instanceName);
      }
    } catch (error) {
      console.error('Error creating match server:', error);
      throw new Error(`Failed to create server for match ${matchConfig.matchId}: ${error}`);
    }
  }

  private async _createGCPInstance(instanceName: string, matchConfig: MatchServerConfig): Promise<{ host: string; port: number }> {
    // This would use the Google Cloud Compute API
    // For now, we'll prepare the structure that would be used:
    
    const computeInstanceConfig = {
      name: instanceName,
      machineType: `zones/${this.zone}/machineTypes/${config.gcp.computeMachine}`,
      sourceTemplate: this.template,
      metadata: {
        items: [
          {
            key: 'match-id',
            value: matchConfig.matchId,
          },
          {
            key: 'map',
            value: matchConfig.map,
          },
          {
            key: 'team-a-players',
            value: matchConfig.players.filter(p => p.team === 0).map(p => p.steamId).join(','),
          },
          {
            key: 'team-b-players',
            value: matchConfig.players.filter(p => p.team === 1).map(p => p.steamId).join(','),
          },
        ],
      },
    };

    console.log('Creating GCP instance with config:', computeInstanceConfig);

    // TODO: Implement actual GCP Compute API call
    // const response = await compute.instances().insert({
    //   project: this.projectId,
    //   zone: this.zone,
    //   requestBody: computeInstanceConfig,
    // }).promise();
    
    // For now, simulate success
    const instance: ServerInstance = {
      instanceName,
      host: `${instanceName}.c.${this.projectId}.internal`, // Placeholder GCP internal IP
      port: parseInt(config.match.serverPort.toString()),
      createdAt: new Date(),
    };
    
    serverRegistry.set(matchConfig.matchId, instance);
    
    return {
      host: instance.host,
      port: instance.port,
    };
  }

  private _createLocalInstance(instanceName: string): { host: string; port: number } {
    // For development/testing
    const basePort = parseInt(config.match.serverPort.toString());
    const portVariation = Math.floor(Math.random() * 1000);
    const port = basePort + portVariation;

    const instance: ServerInstance = {
      instanceName,
      host: 'localhost',
      port,
      createdAt: new Date(),
    };

    return {
      host: instance.host,
      port: instance.port,
    };
  }

  async waitForServerReady(instanceName: string, maxWaitTime: number = 60000): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 5000; // Poll every 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.getServerStatusByInstanceName(instanceName);
        
        if (status === 'ready') {
          console.log(`Server ${instanceName} is ready`);
          return;
        }

        console.log(`Server ${instanceName} status: ${status}, waiting...`);
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error(`Error waiting for server ${instanceName}:`, error);
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error(`Server ${instanceName} did not become ready within ${maxWaitTime}ms`);
  }

  async shutdownServer(matchId: string): Promise<void> {
    const instance = serverRegistry.get(matchId);
    
    if (!instance) {
      console.warn(`No server instance found for match ${matchId}`);
      return;
    }

    try {
      if (this.isProduction && this.projectId) {
        // Production: Delete from GCP
        await this._deleteGCPInstance(instance.instanceName);
      } else {
        // Development: Just remove from registry
        serverRegistry.delete(matchId);
        console.log(`Server ${instance.instanceName} shut down`);
      }
    } catch (error) {
      console.error(`Error shutting down server for match ${matchId}:`, error);
      throw error;
    }
  }

  private async _deleteGCPInstance(instanceName: string): Promise<void> {
    // TODO: Implement actual GCP Compute API delete call
    // const response = await compute.instances().delete({
    //   project: this.projectId,
    //   zone: this.zone,
    //   resource: instanceName,
    // }).promise();

    console.log(`Deleting GCP instance: ${instanceName}`);
    serverRegistry.delete(instanceName);
  }

  async getServerStatus(matchId: string): Promise<'creating' | 'ready' | 'live' | 'shutting_down' | 'stopped'> {
    try {
      // Get match status from database
      const match = await db.query.matches.findFirst({
        where: eq(matches.id, matchId as any),
      });

      if (!match) {
        return 'stopped';
      }

      // Map database match status to server status
      switch (match.status) {
        case 'PENDING':
          return 'creating';
        case 'READY':
          return 'ready';
        case 'LIVE':
          return 'live';
        case 'FINISHED':
          return 'shutting_down';
        case 'CANCELLED':
          return 'stopped';
        default:
          return 'stopped';
      }
    } catch (error) {
      console.error(`Error getting server status for match ${matchId}:`, error);
      return 'stopped';
    }
  }

  private async getServerStatusByInstanceName(instanceName: string): Promise<'creating' | 'ready' | 'live' | 'shutting_down' | 'stopped'> {
    // For development: simulate status progression
    const instance = Array.from(serverRegistry.values()).find(i => i.instanceName === instanceName);
    
    if (!instance) {
      return 'stopped';
    }

    const uptime = Date.now() - instance.createdAt.getTime();
    
    // Simulate status progression: creating (0-10s) -> ready (10s+)
    if (uptime < 10000) {
      return 'creating';
    } else {
      return 'ready';
    }
  }
}

export const orchestrator = new MatchServerOrchestrator();

