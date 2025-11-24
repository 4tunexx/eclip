# Eclip.pro – Full Next.js + Prisma Starter (Option A)

This is a **single Next.js 14 app** with:

- Landing page at `/` with Login / Register / Steam buttons and live stats section.
- Auth pages: `/login`, `/register`.
- Protected dashboard at `/dashboard` using `/api/auth/me`.
- Sidebar layout for all app pages (dashboard, leaderboards, shop, forum, chat, settings, admin).
- Prisma + PostgreSQL integration (`prisma/schema.prisma`).
- Email verification via `/api/auth/verify-email`.
- JWT auth with HttpOnly cookies (`eclip_token`).
- Cloudinary config ready.
- Steam auth endpoint stub (`/api/auth/steam`) – button works, backend returns 501 for now.

## How to use

1. Copy this entire folder to your repo root (or create a new GitHub repo from it).

2. Create `.env.local` in the project root with (example from your setup):

```env
DATABASE_URL=postgresql://...neon...
JWT_SECRET=change_me

EMAIL_SERVER=smtp://noreply@eclip.pro:YOUR_PASSWORD@mailout.one.com:465
EMAIL_FROM=noreply@eclip.pro
EMAIL_VERIFY_URL=https://eclip.pro/api/auth/verify-email

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

API_BASE_URL=https://eclip.pro
WS_URL=wss://eclip.pro

STEAM_API_KEY=...
STEAM_REALM=https://eclip.pro
STEAM_RETURN_URL=https://eclip.pro/api/auth/steam/return
```

3. Install deps & setup DB:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

4. On Vercel:

- Root Directory: `/`
- Build command: `npm run build`
- Env vars: same as `.env.local`.

The Prisma client will be generated on Vercel via the `postinstall` script.

## Next phases

- Implement full Steam OpenID under `/api/auth/steam` + `/api/auth/steam/return`.
- Add match, stats, coins, XP, ranks, cosmetics, admin tools, forum, chat, etc.
