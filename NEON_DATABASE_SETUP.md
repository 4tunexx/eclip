# Setting Up Database Access

## Problem
The verification script failed because `DATABASE_URL` environment variable is not set.

## Solution: Get Your Neon Database URL

### Step 1: Access Neon Console
1. Go to https://console.neon.tech
2. Sign in with your account
3. Find your project in the dashboard

### Step 2: Get Connection String
1. Click on your project
2. Click on "Connection string" or similar button
3. Select "Pooled connection" (recommended for Node.js applications)
4. Copy the connection string - it looks like:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

### Step 3: Add to .env.local

1. **Open .env.local file** in the project root (`/workspaces/eclip/.env.local`)

2. **Paste your DATABASE_URL:**
   ```
   DATABASE_URL="postgresql://your_user:your_password@ep-your-host.neon.tech/your_db?sslmode=require"
   ```

3. **Important Notes:**
   - Keep the entire URL in quotes
   - Replace `your_user`, `your_password`, `your_host`, `your_db` with actual values
   - The URL should include `?sslmode=require` for security
   - Do NOT commit .env.local to git (it's already in .gitignore)

## Step 4: Verify Setup

Once you've added DATABASE_URL to .env.local:

### Option A: Run Verification Script (Logs to file)
```bash
npm run verify:db
```

This will:
- Connect to your Neon database
- Check if all required tables exist
- Log everything to: `logs/verify-db.log`
- Show you what's missing (if anything)

**Output file location:** Check `/workspaces/eclip/logs/verify-db.log` after running

### Option B: View Log Output Manually
After running `npm run verify:db`, check the log:
```bash
cat logs/verify-db.log
```

## Next Steps

### If direct_messages table is MISSING:
```bash
npm run migrate:db
```

Then verify again:
```bash
npm run verify:db
```

### If direct_messages table EXISTS:
Great! Your database is already configured. You can now:
1. Start the dev server: `npm run dev`
2. Test the messaging feature
3. Test the logout flow

## Troubleshooting

### Still getting DNS error?
- Double-check the DATABASE_URL contains the correct hostname
- Make sure your Neon database is not in a "paused" state
- Test connectivity from Neon console

### Connection refused?
- Verify your password is correct
- Check if IP whitelist is configured in Neon (usually all IPs allowed by default)

### Table errors after migration?
- Check `logs/verify-db.log` for specific error messages
- Manually inspect using SQL:
  ```sql
  SELECT * FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```

## Log File Monitoring

All verification and migration output is now saved to:
```
/workspaces/eclip/logs/verify-db.log
```

You can check this file anytime to see:
- Connection status
- What tables were found
- What's missing
- What was created during migration
- Any errors that occurred

Run these to inspect logs:
```bash
# View entire log
cat logs/verify-db.log

# View last 50 lines
tail -50 logs/verify-db.log

# Watch log in real-time while commands run
tail -f logs/verify-db.log

# Search for errors in log
grep "ERROR" logs/verify-db.log
```
