# ECLIP.PRO

## Theme
Neon lime and electric green palette with dark cyber grey and circuit blue accents.

## Architecture
Microservices for Auth, Matchmaking, Game Server Manager, Stats Processor, Anticheat Backend, Notifications, Leaderboard Engine, Tournament Engine, Wallet and Rewards, Admin Panel Backend.

## API
- POST `/auth/steam/callback`
- POST `/queue`
- GET `/leaderboards?period=`
- POST `/matches/report`
- WS `/realtime`

## Setup
- Create `.env` for backend with `DATABASE_URL`, `REDIS_URL`, `PORT`
- Install workspace packages
- Run backend and frontend

## Anticheat
Client app connects to WS and sends integrity ticks.

## Server Mod
Stub connects to WS and emits match updates.