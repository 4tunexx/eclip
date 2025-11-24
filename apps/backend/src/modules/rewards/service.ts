import { z } from "zod"
import type { PoolClient } from "pg"
import type { AppContext } from "../../context"
import { logger } from "../../utils/logger"

const matchCompletedSchema = z.object({
  matchId: z.string().min(1),
  stats: z.array(
    z.object({
      userId: z.string().min(1),
      result: z.enum(["win", "loss", "draw"]).optional(),
      kills: z.number().optional(),
      deaths: z.number().optional(),
      headshots: z.number().optional(),
      mvps: z.number().optional(),
      clutches: z.number().optional(),
      ratingDelta: z.number().optional()
    })
  )
})

export class RewardsService {
  constructor(private readonly ctx: AppContext) {}

  start() {
    if (this.ctx.bus.subscribe) {
      this.ctx.bus.subscribe("match.completed", event => {
        void this.handleMatchCompleted(event.payload)
      })
    } else {
      logger.warn("rewards.bus.subscribe.unavailable")
    }
  }

  async health() {
    return { module: "rewards", status: "ok" as const }
  }

  async getWallet(userId: string) {
    const client = await this.ctx.db.connect()
    try {
      const wallet = await this.ensureWallet(client, userId)
      const txRes = await client.query(
        "SELECT amount, type, reason, created_at FROM transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT 25",
        [wallet.id]
      )
      return {
        wallet: {
          id: wallet.id,
          balance: Number(wallet.balance)
        },
        transactions: txRes.rows.map(row => ({
          amount: Number(row.amount),
          type: row.type,
          reason: row.reason,
          createdAt: row.created_at
        }))
      }
    } finally {
      client.release()
    }
  }

  private async handleMatchCompleted(payload: unknown) {
    const parsed = matchCompletedSchema.safeParse(payload)
    if (!parsed.success) {
      logger.error("rewards.match_completed.invalid_payload", { error: parsed.error.message })
      return
    }
    const event = parsed.data
    const client = await this.ctx.db.connect()
    try {
      await client.query("BEGIN")
      for (const stat of event.stats) {
        const coins = this.calculateCoins(stat.result)
        const wallet = await this.ensureWallet(client, stat.userId)
        await client.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [coins, wallet.id])
        await client.query(
          "INSERT INTO transactions (wallet_id, amount, type, reason) VALUES ($1, $2, $3, $4)",
          [wallet.id, coins, "earn", `Match ${event.matchId}`]
        )
        await client.query("UPDATE users SET coins = COALESCE(coins, 0) + $1 WHERE id = $2", [coins, stat.userId])
      }
      await client.query("COMMIT")
      await this.ctx.bus.publish("wallet.reward", {
        type: "wallet.reward",
        payload: { matchId: event.matchId },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("rewards.distribution.failed", { error, matchId: event.matchId })
    } finally {
      client.release()
    }
  }

  private calculateCoins(result?: string) {
    if (result === "win") return 0.1
    if (result === "loss") return 0.01
    return 0.05
  }

  private async ensureWallet(client: PoolClient, userId: string) {
    const existing = await client.query("SELECT id, balance FROM wallets WHERE user_id = $1", [userId])
    if ((existing.rowCount ?? 0) > 0) {
      return existing.rows[0]
    }
    const inserted = await client.query("INSERT INTO wallets (user_id, balance) VALUES ($1, $2) RETURNING id, balance", [
      userId,
      0
    ])
    return inserted.rows[0]
  }
}
