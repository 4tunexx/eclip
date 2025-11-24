import Redis from "ioredis"
import { EventBus } from "@eclip/shared"
import type { BusEvent } from "@eclip/shared"
import { env } from "./config/env"
import { getDb } from "./db/client"
import type { Pool } from "pg"

type EventHandler = (event: BusEvent) => void

export interface EventBridge {
  publish: <T>(channel: string, event: BusEvent<T>) => Promise<void>
  subscribe?: (channel: string, handler: EventHandler) => void
}

export interface AppContext {
  db: Pool
  redis?: Redis
  bus: EventBridge
}

class LocalEventBus implements EventBridge {
  private readonly listeners = new Map<string, EventHandler[]>()

  async publish<T>(channel: string, event: BusEvent<T>): Promise<void> {
    const handlers = this.listeners.get(channel) || []
    handlers.forEach(handler => {
      try {
        handler(event as BusEvent)
      } catch {}
    })
  }

  subscribe(channel: string, handler: EventHandler) {
    const group = this.listeners.get(channel) || []
    group.push(handler)
    this.listeners.set(channel, group)
  }
}

export const createAppContext = (): AppContext => {
  const db = getDb()
  const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : undefined
  const bus: EventBridge = env.REDIS_URL ? new EventBus(env.REDIS_URL) : new LocalEventBus()

  return { db, redis, bus }
}
