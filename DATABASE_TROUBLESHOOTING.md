# Database Connection Troubleshooting

## Current Status

✅ **What's Working:**
- `.env.local` file created with correct DATABASE_URL
- Environment variables are being loaded by scripts
- Credentials appear to be correct

❌ **What's Not Working:**
- DNS cannot resolve the Neon hostname: `ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech`
- Error: `getaddrinfo ENOTFOUND`
- This suggests a network connectivity issue from the dev container to Neon servers

## Diagnosis Steps

### Step 1: Test Network Connectivity (Run in terminal)

```bash
# Check if container can reach internet
ping -c 1 google.com

# Check DNS resolution
nslookup ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech

# Or use the comprehensive diagnostic
npx tsx scripts/network-diagnostic.ts
```

### Step 2: Possible Solutions

#### Option A: Test Connection from Host Machine
If the dev container cannot reach Neon, test your connection string directly from your local machine:

```bash
# Replace with your actual connection string
psql "postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Or use Node.js
node -e "const postgres = require('postgres'); const sql = postgres('postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'); sql\`SELECT 1\`.then(() => { console.log('✓ Connection works!'); process.exit(0); }).catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });"
```

#### Option B: Check Neon Configuration
1. Go to https://console.neon.tech
2. Check if database is in "Paused" state (if so, resume it)
3. Verify IP whitelist/firewall settings (usually allows all IPs by default)
4. Check if there are any project warnings

#### Option C: Dev Container Network
If connection works on your host but not in the dev container:

1. **Check Dev Container DNS**: Add to `.devcontainer/devcontainer.json`:
   ```json
   {
     "customizations": {
       "codespaces": {
         "openInWebIde": false
       }
     },
     "remoteEnv": {
       "DATABASE_URL": "postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
     }
   }
   ```

2. **Try with IP instead of hostname** (less ideal but tests if DNS is the issue):
   - Get the IP: `nslookup ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech`
   - Use it in DATABASE_URL temporarily

#### Option D: Alternative Connection Methods

**Using connection pooler:**
Your Neon URL already uses the pooler (`pooler` in the hostname), which is correct.

**Check logs:**
```bash
# View recent verification attempts
tail -100 logs/verify-db.log
```

## Commands to Try

### Quick diagnostic:
```bash
npx tsx scripts/network-diagnostic.ts
```

### DNS test:
```bash
npx tsx scripts/test-dns.ts
```

### Once connection is fixed:
```bash
npm run verify:db
npm run migrate:db  # if needed
```

## Next Steps

1. Run the network diagnostic to see what's happening
2. Test your connection string from your local machine (host)
3. Check Neon console to ensure database is running
4. If host connection works but container doesn't, contact GitHub Codespaces support about network access
5. Once connection works, run `npm run verify:db` to check database state
6. If `direct_messages` table is missing, run `npm run migrate:db`

## Important Notes

- The `channel_binding=require` parameter was removed from DATABASE_URL (it was too strict)
- All scripts now load `.env.local` automatically
- The issue is **not** with the code or credentials, but with **network access** from the container to Neon

---

**Need Help?**
- Check Neon console: https://console.neon.tech
- See if database is paused or has errors
- Verify IP whitelist allows external connections
- Test from your host machine first
