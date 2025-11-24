# Eclip.pro – Phase 2 (Auth + DB + Email + Cloudinary)

Single Next.js 14 app with:

- Landing page at `/` (stats wired to `/api/platform/stats`).
- Auth pages: `/login`, `/register`.
- Protected dashboard at `/dashboard` (uses `/api/auth/me`).
- Sidebar layout on all non-landing routes.
- Prisma + Neon integration (`prisma/schema.prisma`).
- Email auth (register sends verification email via `EMAIL_SERVER`).
- JWT auth with HttpOnly cookies.

## Setup

1. Put your `.env.local` with all variables (DATABASE_URL, EMAIL_SERVER, JWT_SECRET, etc.).
2. Install deps and push schema:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Then open http://localhost:3000.

On Vercel, set the same env vars and just deploy.\n