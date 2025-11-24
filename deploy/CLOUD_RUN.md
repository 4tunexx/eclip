# Cloud Run Deployment Guide

This repository uses a monorepo layout:

- `apps/backend` → Fastify API, matchmaking engine, anticheat endpoints.
- `apps/frontend` → Next.js neon UI.
- `packages/shared` → shared event/types library.
- `db/migrations` → Neon/Postgres migrations.

Both services now ship with dedicated Dockerfiles so they can be deployed independently to Google Cloud Run.

## 1. Authenticate & Configure gcloud

```bash
# Authenticate with the provided service account key (local only)
gcloud auth activate-service-account --key-file=./keys/boreal-voyager-472915-f8-f83d25e95b66.json

# Point gcloud at the target project
gcloud config set project eclip-pro

# Set the region you'll deploy to (example: europe-west1)
gcloud config set run/region europe-west1
```

## 2. Build & Push Images with Cloud Build

> All commands run from the repo root so the Docker build context includes the entire workspace/workspaces.

### Backend (Cloud Run service: `eclip-api`)

```bash
# Build & push image
gcloud builds submit \
  --tag gcr.io/eclip-pro/eclip-api:latest \
  --file apps/backend/Dockerfile \
  .
```

### Frontend (Cloud Run service: `eclip-web`)

```bash
gcloud builds submit \
  --tag gcr.io/eclip-pro/eclip-web:latest \
  --file apps/frontend/Dockerfile \
  .
```

## 3. Deploy to Cloud Run

Prepare required environment variables first. Backend must receive at least:

- `DATABASE_URL`
- `STEAM_API_KEY`
- `STEAM_REALM`
- `STEAM_RETURN_URL`
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `JWT_SECRET`
- `REDIS_URL` *(optional but recommended)*

Frontend usually needs:

- `NEXT_PUBLIC_API_URL` (point to the deployed API URL)
- `NEXT_PUBLIC_WS_URL`

### Backend

```bash
gcloud run deploy eclip-api \
  --image gcr.io/eclip-pro/eclip-api:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=... \
  --set-env-vars STEAM_API_KEY=... \
  --set-env-vars STEAM_REALM=... \
  --set-env-vars STEAM_RETURN_URL=... \
  --set-env-vars GCP_PROJECT_ID=eclip-pro \
  --set-env-vars GCP_REGION=europe-west1 \
  --set-env-vars JWT_SECRET=... \
  --set-env-vars REDIS_URL=...
```

### Frontend

```bash
gcloud run deploy eclip-web \
  --image gcr.io/eclip-pro/eclip-web:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://eclip-api-<hash>-uw.a.run.app \
  --set-env-vars NEXT_PUBLIC_WS_URL=wss://eclip-api-<hash>-uw.a.run.app/realtime
```

## 4. Bind Custom Domains

1. Enable the Cloud Run Domain Mapping API once per project:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable domains.googleapis.com
   ```
2. Create mappings:
   ```bash
   gcloud run domain-mappings create --service=eclip-web --domain=eclip.pro
   gcloud run domain-mappings create --service=eclip-api --domain=api.eclip.pro
   ```
3. Google returns DNS `A`/`CNAME` targets; update DNS at your registrar (one.com) accordingly.
4. Wait for SSL certificates to provision (can take ~15 minutes).

## 5. Useful Commands

- Tail backend logs:
  ```bash
  gcloud run services logs read eclip-api --region europe-west1 --limit 100
  ```
- Redeploy after code changes:
  ```bash
  gcloud builds submit --tag gcr.io/eclip-pro/eclip-api:latest --file apps/backend/Dockerfile .
  gcloud run deploy eclip-api --image gcr.io/eclip-pro/eclip-api:latest --region europe-west1 --platform managed
  ```

All commands are safe to paste into your local terminal; no remote authentication is performed from the repo itself.
