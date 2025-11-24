import Redis from "ioredis"

export type BusEventType =
  | "user.login"
  | "matchmaking.queue.joined"
  | "server.spawn.requested"
  | "server.spawned"
  | "match.completed"
  | "wallet.reward"
  | "leaderboard.update"
  | "ac.flagged"
  | "smurf.score.update"

export interface BusEvent<T = unknown> {
  type: BusEventType
  payload: T
  timestamp: string
}

export class EventBus {
  pub: Redis
  sub: Redis
  constructor(url: string) {
    this.pub = new Redis(url)
    this.sub = new Redis(url)
  }
  async publish<T>(channel: string, event: BusEvent<T>) {
    await this.pub.publish(channel, JSON.stringify(event))
  }
  subscribe(channel: string, handler: (event: BusEvent) => void) {
    this.sub.subscribe(channel, () => {})
    this.sub.on("message", (ch, msg) => {
      if (ch !== channel) return
      try {
        handler(JSON.parse(msg))
      } catch {}
    })
  }
}