Required environment variables for Eclip (frontend and services)
--------------------------------------------------------------

Core DB and auth:
- DATABASE_URL: Postgres connection string (required for Prisma/client and backend services)
- REDIS_URL: Redis connection string (EventBus and caching)
- JWT_SECRET: Credential used to sign auth tokens

Email & verification:
- EMAIL_SERVER: SMTP URL (e.g., "smtps://user:pass@smtp.example.com")
- EMAIL_FROM: Email address used for sending (e.g., "noreply@eclip.pro")

Cloudinary (optional, used for uploads):
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Steam & OAuth (optional):
- STEAM_API_KEY
- STEAM_REALM
- STEAM_RETURN_URL

GCP (Optional, if using GCP resources for orchestrator):
- GCP_PROJECT_ID
- GCP_REGION
- GCP_CREDENTIALS_B64 / GCP_CREDENTIALS_JSON

Other service/operational envs:
- NODE_ENV (development|production)
- PORT (service port if overriding)
- MATCH_REGION, DEFAULT_QUEUE, MATCH_SERVER_PORT, MATCH_SERVER_STARTUP_TIMEOUT, MATCH_SERVER_SHUTDOWN_TIMEOUT (for orchestrated server deploy)
- SESSION_SECRET (backend sessions)

Vercel-specific tips:
- Add these environment variables in the Vercel dashboard as Production Environment Variables.
- Use the Vercel team or project secrets to store sensitive keys.

If you don’t have a PostgreSQL DB for local dev, you can set DATABASE_URL to a local Postgres or use a Docker container. For quick tests, consider using a test DB and rotate credentials before deploying to production.
