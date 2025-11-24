# Eclip.pro – Starter Stack (Next.js + Prisma + Neon-ready)

This ZIP contains a minimal but structured foundation for your platform:

- Next.js 14 App Router at `apps/frontend`
- Prisma schema at `/prisma/schema.prisma`
- R2 helper at `src/lib/r2.ts`
- App route groups:
  - `(landing)` – public landing, login, register
  - `(app)` – authenticated app shell with sidebar
- Example API route at `/api/health`

You will still need to:
- Configure DATABASE_URL pointing to Neon
- Run `npm install` in root
- Generate Prisma client from `/prisma/schema.prisma`
- Implement real auth, admin, matchmaking, etc.

This is a solid base to deploy on Vercel and iterate from.
