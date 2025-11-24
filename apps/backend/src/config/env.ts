import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().optional(),
  STEAM_API_KEY: z.string().min(1, "STEAM_API_KEY is required"),
  STEAM_REALM: z.string().min(1, "STEAM_REALM is required"),
  STEAM_RETURN_URL: z.string().min(1, "STEAM_RETURN_URL is required"),
  GCP_PROJECT_ID: z.string().min(1, "GCP_PROJECT_ID is required"),
  GCP_REGION: z.string().min(1, "GCP_REGION is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  MATCH_REGION: z.string().default("eu"),
  DEFAULT_QUEUE: z.string().default("5v5"),
  GCP_COMPUTE_ZONE: z.string().min(1, "GCP_COMPUTE_ZONE is required"),
  GCP_COMPUTE_INSTANCE_TEMPLATE: z.string().min(1, "GCP_COMPUTE_INSTANCE_TEMPLATE is required"),
  MATCH_SERVER_PORT: z.coerce.number().default(27105),
  MATCH_SERVER_STARTUP_TIMEOUT: z.coerce.number().default(120000),
  MATCH_SERVER_SHUTDOWN_TIMEOUT: z.coerce.number().default(15000)
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  STEAM_API_KEY: process.env.STEAM_API_KEY,
  STEAM_REALM: process.env.STEAM_REALM,
  STEAM_RETURN_URL: process.env.STEAM_RETURN_URL,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  GCP_REGION: process.env.GCP_REGION,
  JWT_SECRET: process.env.JWT_SECRET,
  MATCH_REGION: process.env.MATCH_REGION,
  DEFAULT_QUEUE: process.env.DEFAULT_QUEUE,
  GCP_COMPUTE_ZONE: process.env.GCP_COMPUTE_ZONE,
  GCP_COMPUTE_INSTANCE_TEMPLATE: process.env.GCP_COMPUTE_INSTANCE_TEMPLATE,
  MATCH_SERVER_PORT: process.env.MATCH_SERVER_PORT,
  MATCH_SERVER_STARTUP_TIMEOUT: process.env.MATCH_SERVER_STARTUP_TIMEOUT,
  MATCH_SERVER_SHUTDOWN_TIMEOUT: process.env.MATCH_SERVER_SHUTDOWN_TIMEOUT
})
