import { compute_v1, google } from "googleapis"
import { env } from "../../config/env"
import { logger } from "../../utils/logger"

const scopes = ["https://www.googleapis.com/auth/cloud-platform"]

export interface SpawnServerParams {
  matchId: string
  ladder: string
  teamA: string[]
  teamB: string[]
}

export interface SpawnResult {
  instanceName: string
  region: string
  zone: string
  ip?: string
  port: number
}

export class ServerOrchestrator {
  private readonly auth = new google.auth.GoogleAuth({ scopes })
  private readonly compute = new compute_v1.Compute({ auth: this.auth })

  async spawnServer(params: SpawnServerParams): Promise<SpawnResult> {
    const name = this.buildInstanceName(params.matchId)
    const response = await this.compute.instances.insert({
      project: env.GCP_PROJECT_ID,
      zone: env.GCP_COMPUTE_ZONE,
      sourceInstanceTemplate: `projects/${env.GCP_PROJECT_ID}/global/instanceTemplates/${env.GCP_COMPUTE_INSTANCE_TEMPLATE}`,
      requestBody: {
        name,
        labels: {
          match_id: params.matchId.replace(/[^a-z0-9-]/gi, "").toLowerCase(),
          ladder: params.ladder,
          region: env.MATCH_REGION
        },
        metadata: {
          items: [
            { key: "match_id", value: params.matchId },
            { key: "team_a", value: params.teamA.join(",") },
            { key: "team_b", value: params.teamB.join(",") }
          ]
        }
      }
    })

    const operationName = response.data.name
    if (!operationName) {
      throw new Error("GCE_OPERATION_ID_MISSING")
    }
    await this.waitForZoneOperation(operationName)
    const ip = await this.getInstanceIp(name)

    logger.info("orchestrator.spawn.success", { instance: name, matchId: params.matchId })

    return {
      instanceName: name,
      region: env.GCP_REGION,
      zone: env.GCP_COMPUTE_ZONE,
      ip,
      port: env.MATCH_SERVER_PORT
    }
  }

  async shutdownInstance(instanceName: string) {
    const response = await this.compute.instances.delete({
      project: env.GCP_PROJECT_ID,
      zone: env.GCP_COMPUTE_ZONE,
      instance: instanceName
    })
    const operationName = response.data.name
    if (operationName) {
      await this.waitForZoneOperation(operationName)
    }
    logger.info("orchestrator.instance.deleted", { instance: instanceName })
  }

  private async waitForZoneOperation(operationName: string) {
    const end = Date.now() + env.MATCH_SERVER_STARTUP_TIMEOUT
    while (Date.now() < end) {
      const res = await this.compute.zoneOperations.get({
        project: env.GCP_PROJECT_ID,
        zone: env.GCP_COMPUTE_ZONE,
        operation: operationName
      })
      const status = res.data.status
      if (status === "DONE") {
        if (res.data.error) {
          throw new Error(JSON.stringify(res.data.error))
        }
        return
      }
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    throw new Error("MATCH_SERVER_START_TIMEOUT")
  }

  private async getInstanceIp(instanceName: string) {
    const instance = await this.compute.instances.get({
      project: env.GCP_PROJECT_ID,
      zone: env.GCP_COMPUTE_ZONE,
      instance: instanceName
    })
    const nic = instance.data.networkInterfaces?.[0]
    const accessConfig = nic?.accessConfigs?.[0]
    return accessConfig?.natIP || undefined
  }

  private buildInstanceName(matchId: string) {
    const suffix = Math.random().toString(36).substring(2, 7)
    return `eclip-${matchId.substring(0, 8)}-${suffix}`.toLowerCase()
  }
}
