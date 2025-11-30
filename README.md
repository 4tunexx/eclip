# Eclip.pro - Competitive CS2 Platform

A modern competitive platform for Counter-Strike 2 with matchmaking, progression, cosmetics, and anti-cheat integration.

## Features

- ✅ User authentication (Email/Password, Steam login support)
- ✅ Matchmaking queue system
- ✅ Match results and MMR progression
- ✅ Cosmetics shop with coins economy
- ✅ Missions and achievements
- ✅ Leaderboards
- ✅ Forum system
- ✅ Admin panel
- ✅ Anti-cheat event tracking

## Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Redis (optional, for queue management)
- GCP account (for CS2 server orchestration)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `SESSION_SECRET` - Secret for session cookies

Optional variables (for full functionality):
- `REDIS_URL` - Redis connection for queue management
- `STEAM_API_KEY` - For Steam authentication
- GCP variables - For server orchestration
- Email settings - For email verification

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000` (or the port specified in package.json).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── (app)/          # Authenticated routes
│   │   ├── admin/      # Admin panel
│   │   ├── dashboard/  # User dashboard
│   │   ├── play/       # Matchmaking
│   │   └── ...
│   ├── api/            # API routes
│   └── page.tsx        # Landing page
├── components/         # React components
├── lib/
│   ├── db/            # Database schema and connection
│   ├── auth.ts        # Authentication utilities
│   ├── config.ts      # Configuration
│   └── redis.ts       # Redis utilities
└── hooks/             # React hooks
```

## Database

The database schema is defined in `src/lib/db/schema.ts` using Drizzle ORM. All tables are already created in your Neon database.

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Shop
- `GET /api/shop/items` - List cosmetics
- `POST /api/shop/purchase` - Buy cosmetic
- `POST /api/shop/equip` - Equip cosmetic

### Queue & Matches
- `POST /api/queue/join` - Join queue
- `GET /api/queue/status` - Queue status
- `POST /api/queue/leave` - Leave queue
- `GET /api/matches` - Get user matches
- `POST /api/matches/[id]/result` - Submit match result

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/users/[id]` - Get user details
- `PATCH /api/admin/users/[id]` - Update user
- `GET /api/admin/matches` - List matches
- `GET /api/admin/cosmetics` - Manage cosmetics
- `GET /api/admin/anti-cheat/events` - View AC events

## Development Status

The platform is ~85% complete. See `FINAL_STATUS.md` for detailed status.

## License

Private project
