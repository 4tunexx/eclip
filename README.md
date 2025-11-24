# Eclip.pro — Competitive CS2 Platform

Eclip.pro is a modern, neon-styled esports competitive platform designed for CS2.  
It provides matchmaking, leaderboards, player profiles, rewards, coins, anticheat, and Google Cloud-powered CS2 servers.

## ?? Tech Stack

- **Frontend:** Next.js 14, TypeScript, TailwindCSS, Shadcn UI  
- **Backend:** Node.js, TypeScript, Express/Fastify  
- **Database:** Neon.tech (PostgreSQL)  
- **Hosting:** Google Cloud Run  
- **Game Servers:** Google Cloud Compute Engine (ephemeral VM instances)  
- **Authentication:** Steam OpenID  
- **AC:** Lightweight Windows client + secure backend  
- **Design:** Neon green cyber-esports theme  

## ?? Domain
Production Domain: **https://eclip.pro**

## ?? Features
- Steam login
- Matchmaking queue
- Rank system & ELO
- CS2 dedicated server spawner (Google Cloud API)
- Automated match handling
- Reward coins (+0.1 win / +0.01 loss)
- Leaderboards: daily/weekly/monthly/all-time
- Player achievements & trophies
- Anticheat event ingestion
- Admin / moderator panel

## ?? Installation

Clone project:

```
git clone https://github.com/YOUR_REPO/eclip

cd eclip
```

Install:

```
npm install
```

Run dev:

```
npm run dev
```

## ?? Environment Variables

Create `.env`:

```
DATABASE_URL=postgresql://...
STEAM_API_KEY=xxxxxx
STEAM_REALM=http://localhost:3000

STEAM_RETURN_URL=http://localhost:3000/api/auth/steam/return

GCP_PROJECT_ID=eclip-pro
GCP_REGION=europe-west1
JWT_SECRET=SUPERSECRET
```

## ?? Deployment

To deploy backend to Google Cloud Run:

```
gcloud builds submit --tag gcr.io/eclip-pro/api
gcloud run deploy eclip-api --image gcr.io/eclip-pro/api --platform managed
```

## ?? License
MIT
