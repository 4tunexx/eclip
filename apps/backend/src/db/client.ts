import { Pool } from "pg"
import { env } from "../config/env"

let pool: Pool | null = null

export const getDb = () => {
  if (!pool) {
    pool = new Pool({ connectionString: env.DATABASE_URL })
  }
  return pool
}

export type DbClient = Pool
