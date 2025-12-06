# Eclip Platform

A competitive gaming platform with ranking system, cosmetics shop, achievements, missions, and anti-cheat integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (Neon recommended)
- npm or yarn

### Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/4tunexx/eclip.git
   cd eclip
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with:
   - `DATABASE_URL` - PostgreSQL connection
   - `JWT_SECRET` - JWT signing key (generate: `openssl rand -hex 32`)
   - `SESSION_SECRET` - Session secret

3. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start Development**
   ```bash
   npm run dev
   # App: http://localhost:9002
   ```

5. **Create Admin Account**
   ```bash
   curl -X POST http://localhost:9002/api/admin/setup-admin
   # Email: admin@eclip.pro | Password: Admin123!
   ```

## 📋 Features

- ✅ **Authentication** - Email/password, sessions, JWT, password reset
- ✅ **User Progression** - Levels, XP, ESR ranking, coins
- ✅ **Achievements** - 50+ achievements with unlock tracking
- ✅ **Missions** - Daily/weekly challenges with rewards
- ✅ **Cosmetics Shop** - Avatar frames, banners, badges, titles (coins-based)
- ✅ **Admin Panel** - User management, coin grants, system stats
- ✅ **Anti-Cheat System** - Event logging, violation tracking, AI-powered review
- ✅ **Notifications** - System alerts for achievements, missions, level-ups
- ✅ **Leaderboards** - Ranked by ESR and level
- ✅ **Forum System** - Categories, threads, posts

## 🏗️ Architecture

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/      # User dashboard
│   │   ├── admin/          # Admin panel
│   │   ├── missions/       # Mission browser
│   │   ├── achievements/   # Achievement browser
│   │   └── shop/           # Cosmetics shop
│   ├── api/
│   │   ├── auth/           # Login, register, sessions
│   │   ├── missions/       # Mission API
│   │   ├── achievements/   # Achievement API
│   │   ├── admin/          # Admin endpoints
│   │   └── admin/setup-admin/  # Initial admin setup
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Reusable UI (shadcn/ui)
├── hooks/                  # React hooks
├── lib/
│   ├── auth.ts             # JWT & session management
│   ├── db/
│   │   ├── index.ts        # Drizzle connection
│   │   └── schema.ts       # Database schema
│   └── config.ts
└── ai/                     # Genkit AI flows

drizzle/                    # Database migrations
scripts/
├── run-migrations.js       # Apply migrations
└── add-admin.js            # Create admin (CLI)
```

## 📊 Database Schema (26 Tables)

**User Management:**
- `users` - Accounts, progression, cosmetics
- `sessions` - JWT token sessions
- `user_profiles` - Extended profile data

**Progression:**
- `missions` - Mission definitions
- `user_mission_progress` - Progress tracking
- `achievements` - Achievement definitions
- `user_achievements` - Unlock tracking
- `badges` - Badge definitions

**Shop & Economy:**
- `cosmetics` - Cosmetic items
- `user_inventory` - Owned cosmetics

**Social:**
- `notifications` - System notifications
- `forum_categories`, `forum_threads`, `forum_posts` - Forum

**Gameplay:**
- `queue_tickets` - Matchmaking queue
- `matches` - Match results
- `match_players` - Per-player match stats

**Safety:**
- `ac_events` - Anti-cheat events
- `bans` - Player bans

**Admin:**
- `esr_thresholds` - Rank tiers
- `level_thresholds` - Level progression
- `role_permissions` - Permission system

## 🔗 API Endpoints

**Auth:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

**Missions:**
- `GET /api/missions` - List missions
- `POST /api/missions/:id/complete` - Complete & reward

**Achievements:**
- `GET /api/achievements` - List achievements
- `POST /api/achievements/:id/unlock` - Unlock

**Shop:**
- `GET /api/cosmetics` - List cosmetics
- `POST /api/cosmetics/:id/purchase` - Buy
- `POST /api/cosmetics/:id/equip` - Equip

**Admin:**
- `POST /api/admin/setup-admin` - Create admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users/:id/coins` - Grant/remove coins
- `GET /api/admin/stats` - System stats

## 🛠️ Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run start        # Run production
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run db:migrate   # Apply database migrations
npm run db:introspect # Sync schema from live DB
```

## 📝 Environment Variables

**Required:**
```env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-random-secret-key
SESSION_SECRET=another-random-secret
```

**Optional:**
```env
STEAM_API_KEY=your-steam-api-key
GCP_PROJECT_ID=your-gcp-project
GENKIT_API_KEY=your-genkit-key
EMAIL_USER=support@domain.com
EMAIL_PASSWORD=your-app-password
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy (auto on push)

### Docker
```bash
docker build -t eclip .
docker run -p 9002:9002 --env-file .env.local eclip
```

### VPS/Server
```bash
npm install && npm run build && npm run db:migrate && npm start
```

## ❓ Troubleshooting

| Issue | Fix |
|-------|-----|
| DB Connection | Check `DATABASE_URL` format |
| Admin Failed | Run `/api/admin/setup-admin` endpoint |
| Build Error | `rm -rf .next && npm run build` |
| Migrations Fail | `npm run db:migrate` manually |

## 🔐 Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens (HS256)
- HttpOnly session cookies
- SQL injection protected (Drizzle ORM)
- CORS & CSP headers
- Rate limiting on auth endpoints

## 📄 License

Copyright © 2025 Eclip. All rights reserved.

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Open PR

---

**Status:** ✅ Production Ready | **v1.0.0** | **December 2025**
