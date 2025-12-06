# 🚨 URGENT FIX: Database Migrations Not Initialized

## Problem Summary

Your logs show this error:
```
relation "public.User" does not exist
```

**Root Cause**: The database migrations have **not been run** in production. The Drizzle ORM tables (`users`, `sessions`, etc.) don't exist yet.

---

## Solution (Choose One)

### ✅ OPTION 1: Run Migration via New API Endpoint (RECOMMENDED)

This is the fastest way to fix it in production.

**Step 1**: Make sure the endpoint is deployed
- The file `/src/app/api/admin/migrate/route.ts` has been created
- Redeploy your app (or it will be on next commit)

**Step 2**: Run the migration
```bash
# Set your migration secret (or use default 'dev-only')
MIGRATION_SECRET="dev-only"

# Run from your local machine:
curl -X POST https://www.eclip.pro/api/admin/migrate \
  -H "Authorization: Bearer dev-only" \
  -H "Content-Type: application/json"
```

**Step 3**: Verify it worked
```bash
curl https://www.eclip.pro/api/admin/migrate
```

You should see:
```json
{
  "status": "migrated",
  "tableCount": 59,
  "message": "Database is properly migrated"
}
```

---

### ✅ OPTION 2: Run Migration Locally (Alternative)

If the API endpoint isn't available yet, run migrations locally:

**Step 1**: Make sure you have a `.env.local` file with your production DATABASE_URL:
```bash
# In /workspaces/eclip/.env.local
DATABASE_URL=your-neon-database-url
```

**Step 2**: Run the migration script:
```bash
cd /workspaces/eclip
npm install  # Make sure dependencies are installed
npm run db:migrate
```

**Step 3**: Wait for completion (should say "Migrations applied")

---

### ✅ OPTION 3: Using Neon Console (If you have database access)

1. Go to https://console.neon.tech
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `/workspaces/eclip/drizzle/0000_flippant_trish_tilby.sql`
5. Paste and execute

---

## What Gets Created

The migrations will create these key tables:
- ✅ `users` - User accounts (email, username, password)
- ✅ `sessions` - User sessions/tokens
- ✅ `cosmetics` - Cosmetic items (frames, banners, etc)
- ✅ `user_inventory` - Items users own
- ✅ `missions` - Daily/weekly missions
- ✅ `achievements` - Achievement system
- ✅ `matches` - Game match data
- ✅ `user_profiles` - Extended user info
- ✅ +50 more tables for full platform

---

## After Migration: Testing

### 1. Check health endpoint
```bash
curl https://www.eclip.pro/api/health
```
Should show `database: connected`

### 2. Try creating an account
```bash
curl -X POST https://www.eclip.pro/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```
Should return `201 Created` with user data

### 3. Try logging in
```bash
curl -X POST https://www.eclip.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```
Should return session token

### 4. Try Steam login
Visit: `https://www.eclip.pro/api/auth/steam`
Should redirect to Steam login

---

## Troubleshooting

### "Authorization: Bearer ... not working"
The default secret is `dev-only` if `MIGRATION_SECRET` env var isn't set in Vercel.

To change it:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `MIGRATION_SECRET=your-secret-here`
3. Redeploy

### "Database connection refused"
- Check `DATABASE_URL` is correct in Vercel environment
- Make sure it's not expired (Neon tokens expire)
- Verify database is accessible from Vercel's region

### "Still getting 'relation ... does not exist'"
1. Run `/api/admin/migrate` again
2. Check the response for errors
3. If it says "tableCount: 0", migrations might have failed partially

---

## Security Note ⚠️

The migration endpoint is protected:
- ✅ Only runs from localhost OR with Bearer token
- ✅ Token defaults to "dev-only" (change in production!)
- ✅ Should only be called once

After migrations complete:
1. ⚠️ Remove or disable this endpoint in production
2. ⚠️ Change `MIGRATION_SECRET` if exposed

---

## Next Steps After Migration

1. ✅ Database is initialized
2. Create admin user:
   ```bash
   npm run scripts/make-me-admin.js <your-user-id>
   ```
3. Seed platform data (missions, cosmetics, achievements)
4. Test all auth flows
5. Monitor logs for any remaining 500 errors

---

## Questions?

Check these files:
- `/workspaces/eclip/drizzle/` - SQL migration files
- `/src/lib/db/schema.ts` - Schema definitions
- `/src/app/api/health/route.ts` - Health check endpoint
- `/src/app/api/admin/migrate/route.ts` - Migration endpoint (NEW)

Good luck! 🚀
