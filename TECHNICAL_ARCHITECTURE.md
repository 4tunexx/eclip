# Technical Architecture - Database & Authentication

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                          │
│  (www.eclip.pro - Next.js on Vercel)                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├──────────────────────────────┐
                 │                              │
        ┌────────▼────────┐          ┌──────────▼──────────┐
        │   Authentication │          │   Data Endpoints   │
        │   Routes (Auth)  │          │   /api/missions    │
        │  /api/auth/*     │          │   /api/cosmetics   │
        │                  │          │   /api/matches     │
        │ - login          │          │   /api/user/*      │
        │ - register       │          └──────────┬──────────┘
        │ - steam          │                     │
        │ - me             │                     │
        │ - migrate (NEW!) │                     │
        └────────┬─────────┘                     │
                 │                              │
                 └──────────────┬───────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Database Client      │
                    │  (postgres-js +        │
                    │   drizzle-orm)         │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Neon PostgreSQL DB   │
                    │  (Production)          │
                    │                        │
                    │  - 59 tables           │
                    │  - users               │
                    │  - sessions            │
                    │  - missions            │
                    │  - achievements        │
                    │  - matches             │
                    │  - cosmetics           │
                    │  - ... and more        │
                    └────────────────────────┘
```

---

## Authentication Flow

### Before Fix (Broken)
```
User → Login/Register Request
  ↓
API Route (login/register)
  ↓
Query Database for users table
  ↓
❌ TABLE DOESN'T EXIST
  ↓
500 Internal Server Error
  ↓
User sees "Internal Server Error"
```

### After Fix (Working)
```
User → Login/Register Request
  ↓
API Route (login/register)
  ↓
Query Database for users table
  ↓
✅ TABLE EXISTS (after migration)
  ↓
User data retrieved/created
  ↓
Password verified/hashed
  ↓
Session token created
  ↓
User logged in successfully
```

### Migration Process (New)
```
Admin/User → curl /api/admin/migrate
  ↓
Authorization Check (Bearer token)
  ↓
Drizzle Migrator initialization
  ↓
Read migration files from /drizzle/
  ↓
Execute 3 SQL migration files:
  - 0000_flippant_trish_tilby.sql (creates all tables)
  - 0001_esr_thresholds_divisions.sql (adds columns)
  - 0002_rename_mmr_to_esr.sql (renames columns)
  ↓
Verify tables created (count should be 59)
  ↓
Return success response with details
```

---

## Database Schema (Simplified)

```sql
-- Users table (for authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    steam_id TEXT UNIQUE,
    role ENUM('USER', 'VIP', 'ADMIN'),
    esr INTEGER DEFAULT 1000,
    coins DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Sessions table (for auth tokens)
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- Other tables...
CREATE TABLE missions (
    id UUID PRIMARY KEY,
    title TEXT,
    description TEXT,
    reward_xp INTEGER,
    reward_coins INTEGER
);

CREATE TABLE cosmetics (
    id UUID PRIMARY KEY,
    name TEXT,
    type ENUM('Frame', 'Banner', 'Badge'),
    price DECIMAL(10,2)
);

-- 53 more tables...
```

---

## Code Architecture

### File Structure
```
/src
  /app/api
    /admin
      /migrate
        route.ts          ← NEW: Migration endpoint
    /auth
      /login/route.ts    ← MODIFIED: Better errors
      /register/route.ts ← MODIFIED: Better errors
      /me/route.ts
      /steam/route.ts
    /health/route.ts
    /missions/route.ts
    /cosmetics/route.ts
  /lib
    /db
      index.ts          ← Database client
      schema.ts         ← Schema definitions (Drizzle)
    /auth.ts            ← Auth utilities
    /email.ts           ← Email sending
    /config.ts          ← Config loader
    /verify-env.ts      ← Env validation

/drizzle
  0000_flippant_trish_tilby.sql    ← Create all tables
  0001_esr_thresholds_divisions.sql ← Add ESR columns
  0002_rename_mmr_to_esr.sql        ← Rename MMR → ESR
  meta/
    _journal.json       ← Migration history

/scripts
  /run-migrations.js            ← Old migration script
  /prod-migrate-init.js         ← NEW: Better script
```

---

## Authentication Flow with Session

```
┌──────────────────────────────────────────────────┐
│ User Registration                                 │
└──────────────────────────────────────────────────┘
    ↓
1. POST /api/auth/register
   Body: { email, username, password }
    ↓
2. Validate input with Zod schema
   - Email format valid?
   - Username 3-20 chars?
   - Password 8+ chars?
    ↓
3. Hash password with bcrypt
   Original:  "SecurePass123!"
   Hashed:    "$2a$10$xyz..."
    ↓
4. INSERT into users table
   - ID: generated UUID
   - email: validated email
   - username: validated username
   - password_hash: hashed password
   - role: 'USER'
   - esr: 1000
   - coins: 0
    ↓
5. CREATE session token
   - Generate JWT with userId
   - INSERT into sessions table
   - Token expires in 30 days
    ↓
6. Return to client
   - User data (id, email, username)
   - Set-Cookie: session=<token>
   ↓
┌──────────────────────────────────────────────────┐
│ User Login                                        │
└──────────────────────────────────────────────────┘
    ↓
1. POST /api/auth/login
   Body: { email, password }
    ↓
2. SELECT from users WHERE email = ?
    ↓
3. Compare password with bcrypt
   Provided:  "SecurePass123!"
   Stored:    "$2a$10$xyz..."
   Match?     YES ✓
    ↓
4. Create new session
   - Generate JWT
   - INSERT into sessions table
    ↓
5. Return session token to client
    ↓
┌──────────────────────────────────────────────────┐
│ Protected API Request                             │
└──────────────────────────────────────────────────┘
    ↓
1. GET /api/user/profile
   Header: { Cookie: session=<token> }
    ↓
2. Middleware: verify JWT
   - Decode token
   - Extract userId
   - Check if expired
    ↓
3. Query: SELECT from users WHERE id = ?
    ↓
4. Return user data
```

---

## Database Connection

### Connection Pool
```typescript
// From src/lib/db/index.ts

const connectionString = process.env.DATABASE_URL;
// Format: postgresql://user:password@host:5432/dbname

const client = postgres(connectionString, { max: 1 });
// max: 1 = single connection (Vercel limitations)

const db = drizzle(client, { schema });
// Drizzle ORM wrapper for type safety
```

### Query Examples

```typescript
// Create user
const user = await db.insert(users).values({
    email: 'user@example.com',
    username: 'username',
    passwordHash: hashedPassword,
}).returning();

// Find user by email
const [user] = await db.select()
    .from(users)
    .where(eq(users.email, 'user@example.com'))
    .limit(1);

// Update user
await db.update(users)
    .set({ esr: 1500 })
    .where(eq(users.id, userId));

// Get user with missions
const userMissions = await db.select()
    .from(userMissionProgress)
    .where(eq(userMissionProgress.userId, userId));
```

---

## Migration System

### How Drizzle Migrations Work

```
1. Schema Definition
   └─ src/lib/db/schema.ts
      Defines: users, sessions, cosmetics, etc.

2. Generate SQL
   └─ npm run db:generate
      Creates: drizzle/0000_*.sql

3. Track Progress
   └─ drizzle_migrations_journal table
      Records: which migrations have run

4. Apply Migrations
   └─ npm run db:migrate
      Runs SQL files that haven't been applied

5. Verify Results
   └─ Check: tables exist, columns match
```

### Migration File Structure
```sql
-- drizzle/0000_flippant_trish_tilby.sql

CREATE TYPE "user_role" AS ENUM('USER', 'VIP', 'ADMIN');
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" text NOT NULL UNIQUE,
    ...
);
CREATE TABLE "sessions" (...);
... (59 tables total)
```

---

## Error Handling

### Before Fix
```
User tries to login
  ↓
Query fails: "relation public.user does not exist"
  ↓
Generic catch-all error handler
  ↓
Return: { "error": "Internal server error" }
Response Code: 500
  ↓
User sees generic error, doesn't know what to do
```

### After Fix
```
User tries to login
  ↓
Query fails: "relation public.user does not exist"
  ↓
NEW: Specific error handler
  Detects: "relation ... does not exist"
  ↓
Return: 
{
  "error": "Database not initialized",
  "message": "Tables haven't been created",
  "action": "Run POST /api/admin/migrate",
  "status": "not-migrated"
}
Response Code: 503 (Service Unavailable)
  ↓
User understands the issue and can fix it!
```

---

## Security Model

### Password Security
```
User Password: "MyPassword123!"
    ↓
bcryptjs hashing (10 rounds)
    ↓
Stored: "$2a$10$salt$hashedvalue"
    ↓
On Login:
  User enters: "MyPassword123!"
  Compare with bcrypt
  Match? ✓ Allow login
  No match? Deny login
```

### Session Security
```
Token: JWT with userId + expiration
    ↓
Stored in: sessions table + browser cookie
    ↓
Cookie settings:
  - httpOnly: true (JS can't access)
  - secure: true (HTTPS only in prod)
  - sameSite: lax (CSRF protection)
  - expires: 30 days
    ↓
On API call:
  Verify token signature
  Check expiration
  Extract userId
  Allow or deny request
```

### Migration Endpoint Security
```
Endpoint: POST /api/admin/migrate
    ↓
Check: Is request from localhost?
  If yes → Allow (no auth needed)
  If no → Check Authorization header
    ↓
Required: Authorization: Bearer <token>
Default token: "dev-only"
    ↓
Change in Vercel:
  Add env var: MIGRATION_SECRET=<your-secret>
  Redeploy
  Use new token
```

---

## Data Flow Summary

```
┌─ User Creates Account ──────────────────┐
│                                         │
│ 1. Browser sends registration request   │
│ 2. API validates input                  │
│ 3. Password is hashed                   │
│ 4. User inserted in database            │
│ 5. Session created                      │
│ 6. Token returned to browser            │
│ 7. Token stored in secure cookie        │
│                                         │
└─────────────────────────────────────────┘

┌─ User Accesses Protected Resource ─────┐
│                                        │
│ 1. Browser sends request with cookie   │
│ 2. Middleware extracts token           │
│ 3. Token signature verified            │
│ 4. Expiration checked                  │
│ 5. userId extracted from token         │
│ 6. User data fetched from database     │
│ 7. Response sent to client             │
│                                        │
└────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Runtime | Next.js 15 | Node.js HTTP framework |
| Hosting | Vercel | Deployment platform |
| Database | PostgreSQL (Neon) | Data storage |
| ORM | Drizzle | Type-safe queries |
| Auth | JWT + Sessions | Authentication |
| Password Hash | bcryptjs | Secure passwords |
| Validation | Zod | Input validation |
| Schema Management | Drizzle Kit | Migrations |

---

## Monitoring & Debugging

### Check Migration Status
```bash
curl https://www.eclip.pro/api/admin/migrate
# Returns: { status, tableCount, message }
```

### Check API Health
```bash
curl https://www.eclip.pro/api/health
# Returns: { status, services: { database, email } }
```

### View Database
```bash
# In Neon console
SELECT * FROM users;
SELECT * FROM sessions;
SELECT COUNT(*) FROM drizzle_migrations_journal;
```

### Check Logs
```bash
# In Vercel dashboard
Deployments → Logs → Function Logs
Search for: [Login], [Register], [Migration]
```

---

## Conclusion

The system is designed to be:
- ✅ Secure (passwords hashed, tokens signed)
- ✅ Scalable (database-backed, stateless API)
- ✅ Maintainable (Drizzle schema in code)
- ✅ Recoverable (migration endpoint)
- ✅ Observable (detailed logging)

The migration endpoint addition ensures the system can be initialized even in non-standard deployment scenarios.

---

**For more details, see the specific guide files or the code itself!**
