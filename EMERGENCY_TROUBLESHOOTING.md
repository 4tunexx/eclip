# Emergency Troubleshooting - Database Issues

## 🔴 Symptom: "relation "public.User" does not exist"

### Quick Fix (30 seconds)
```bash
curl -X POST https://www.eclip.pro/api/admin/migrate -H "Authorization: Bearer dev-only"
```

### What This Means
Database tables have never been created. Drizzle migrations haven't run.

### Why It Happened
- Deployment happened before migrations were applied
- Database was reset but migrations weren't re-run
- Vercel deployment didn't trigger post-deploy script

---

## 🔴 Symptom: "registration failed" / "login failed" (500 error)

### Possible Causes & Fixes

**1. Database Not Migrated**
```bash
# Check status
curl https://www.eclip.pro/api/admin/migrate
# Should show "status": "migrated"

# If not, run migration
curl -X POST https://www.eclip.pro/api/admin/migrate -H "Authorization: Bearer dev-only"
```

**2. DATABASE_URL Not Set in Vercel**
```bash
# Check your Vercel dashboard:
# Settings → Environment Variables → DATABASE_URL exists?
# If not, add it from your Neon console
```

**3. Database Connection Refused**
```bash
# Test locally with psql
psql $DATABASE_URL
# If fails, Neon database might be down or URL wrong
```

---

## 🔴 Symptom: Migrations Keep Failing

### Check These

1. **Verify database exists**
   ```bash
   # In Neon console: SQL Editor
   SELECT version();
   # Should return PostgreSQL version
   ```

2. **Check permissions**
   ```sql
   -- In Neon console
   SELECT current_user;
   -- Should be your database user
   ```

3. **Look for partial migrations**
   ```sql
   -- In Neon console
   SELECT * FROM drizzle_migrations_journal;
   -- Check if any failed
   ```

4. **Reset and retry** (if needed)
   ```sql
   -- CAREFUL: Drops all tables!
   DROP SCHEMA IF EXISTS public CASCADE;
   CREATE SCHEMA public;
   
   -- Then re-run migrations
   ```

---

## 🔴 Symptom: "Authorization: Bearer dev-only" Returns 401

### Fixes

**1. Check if on localhost**
```bash
# Should work without token on localhost
curl -X POST http://localhost:3000/api/admin/migrate
```

**2. Update token in Vercel**
In Vercel dashboard:
1. Settings → Environment Variables
2. Add `MIGRATION_SECRET=your-secret`
3. Redeploy
4. Use: `curl ... -H "Authorization: Bearer your-secret"`

**3. Check deployment finished**
- Wait for Vercel to finish deploying
- Refresh the site to clear cache
- Try again

---

## 🔴 Symptom: Tables Exist But Still Getting Errors

### Root Cause Investigation

**1. Check table structure**
```sql
-- In Neon SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

**2. Verify users table exists**
```sql
SELECT COUNT(*) FROM users;
-- Should return a number, not error
```

**3. Check for constraint issues**
```sql
SELECT * FROM pg_indexes WHERE tablename = 'users';
-- Should list indexes
```

---

## 🔴 Symptom: Migration Runs But Tables Still Don't Work

### Check These

1. **Verify schema was actually created**
```bash
curl https://www.eclip.pro/api/admin/migrate
# Check tableCount in response
# Should be 59, not 0
```

2. **Clear Node cache** (in Vercel)
```bash
# Vercel → Deployments → Right-click latest → Redeploy
```

3. **Check for stale connections**
```bash
# Try again after waiting 30 seconds
# Sometimes connection pooling causes issues
```

---

## 🟡 Symptom: API Returns 503 "Database not initialized"

### This is Good News!
This means your new error message is working correctly!

### Fix
```bash
# The API is telling you to run:
curl -X POST https://www.eclip.pro/api/admin/migrate -H "Authorization: Bearer dev-only"
```

---

## 🟡 Symptom: Logs Show "tableCount: 0"

### This Means
Migration ran but created no tables. Likely issues:

**1. Migrations folder missing**
```bash
# Check file exists
ls -la /workspaces/eclip/drizzle/
# Should have 0000_*.sql files
```

**2. Wrong database URL**
```bash
# Verify it's PostgreSQL (not MySQL, SQLite, etc)
# Format: postgresql://user:pass@host/dbname
echo $DATABASE_URL
```

**3. Permission issues**
```sql
-- In Neon SQL Editor
GRANT ALL ON SCHEMA public TO your_user;
```

---

## 🟢 How to Verify Everything Works

### Complete Check
```bash
#!/bin/bash

echo "1. Check migration status..."
curl https://www.eclip.pro/api/admin/migrate | grep tableCount

echo "2. Check API health..."
curl https://www.eclip.pro/api/health | grep database

echo "3. Try registration..."
curl -X POST https://www.eclip.pro/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"TestPass123"}'

echo "4. Try login..."
curl -X POST https://www.eclip.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123"}'

echo "Done!"
```

---

## 📞 Still Stuck?

### Check These Resources

1. **Detailed Guide**: `/DATABASE_MIGRATION_FIX.md`
2. **Quick Start**: `/QUICK_FIX_GUIDE.md`
3. **Schema Info**: `/src/lib/db/schema.ts`
4. **Migration Files**: `/drizzle/`
5. **API Endpoint**: `/src/app/api/admin/migrate/route.ts`

### Debug Commands

```bash
# Check database tables
psql $DATABASE_URL -c "\dt"

# Check specific table
psql $DATABASE_URL -c "\d users"

# Count rows in users
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# Check migration journal
psql $DATABASE_URL -c "SELECT * FROM drizzle_migrations_journal LIMIT 10;"
```

### Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Deployments → Select latest
4. Function Logs tab
5. Filter for "admin/migrate" or "login"

---

## Emergency Contact

If nothing works:

1. **Check if you can access the database directly**
   - Neon console: https://console.neon.tech
   - SQL Editor tab
   - Try: `SELECT 1;`

2. **Verify deployment succeeded**
   - Vercel dashboard
   - Check for failed deployments
   - Check build logs for errors

3. **Nuclear Option** (Last Resort)
   - Delete Neon database
   - Create new one
   - Run migrations fresh
   - Seed data if needed

---

## Prevention for Future

✅ Always run migrations after deployment:
```bash
# In your CD/CD pipeline
npm run db:migrate

# Or create Vercel build hook to call the API endpoint
```

✅ Set up monitoring:
```bash
# Add to your monitoring
curl -s https://www.eclip.pro/api/admin/migrate | grep migrated
```

✅ Keep migration logs:
```bash
# In migration endpoint response, logs show exactly what was created
```

---

Good luck! You've got this! 🚀
