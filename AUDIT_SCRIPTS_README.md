# 🔍 ECLIP AUDIT SCRIPTS - How to Run Them

I've created several audit scripts that you can run manually and share the output with me. Here's how to use each one:

---

## 📋 Quick Start (Start Here!)

**Run the database quick check first:**

### On Linux/Mac:
```bash
node scripts/db-quick-check.js 2>&1 | tee db-check-results.log
```

### On Windows (PowerShell):
```powershell
node scripts/db-quick-check.js 2>&1 | Tee-Object -FilePath db-check-results.txt
```

### On Windows (Command Prompt):
```batch
node scripts/db-quick-check.js > db-check-results.txt 2>&1
```

Then share the `db-check-results.log` or `db-check-results.txt` file with me!

---

## 🔧 Available Audit Scripts

### 1. **Database Quick Check** (FASTEST - 30 seconds)
**File:** `scripts/db-quick-check.js`

**What it checks:**
- ✅ Database connection status
- ✅ Total users, admins, sessions
- ✅ Match data, forum, cosmetics
- ✅ Data quality issues
- ✅ Admin users exist?
- ✅ Forum categories initialized?
- ✅ Top 5 users by ESR
- ✅ Recent matches & users
- ✅ Recommendations for fixes

**Run it:**
```bash
node scripts/db-quick-check.js 2>&1 | tee db-check-results.log
```

**Expected output:** ~200 lines with detailed health status

---

### 2. **Full System Audit** (COMPREHENSIVE - 2-3 minutes)
**File:** `scripts/full-audit.sh` (Linux/Mac) or `scripts/full-audit.bat` (Windows)

**What it checks:**
- ✅ Environment & Node/npm versions
- ✅ Dependencies & node_modules
- ✅ Codebase for hardcoded values
- ✅ Database connection (uses db-quick-check)
- ✅ TypeScript compilation errors
- ✅ API routes
- ✅ Database schema
- ✅ Authentication files

**Run it:**

**On Linux/Mac:**
```bash
bash scripts/full-audit.sh 2>&1 | tee full-audit-results.log
```

**On Windows (PowerShell):**
```powershell
cmd /c scripts/full-audit.bat | Tee-Object -FilePath full-audit-results.txt
```

**On Windows (Command Prompt):**
```batch
cmd /c scripts/full-audit.bat > full-audit-results.txt 2>&1
```

**Expected output:** ~300-500 lines with everything checked

---

### 3. **Direct SQL Audit** (Database Only)
**File:** `DATABASE_AUDIT.sql`

**How to run it:**

1. Go to https://console.neon.tech
2. Select your project
3. Open "SQL Editor"
4. Copy content from `DATABASE_AUDIT.sql`
5. Paste it in the editor
6. Run each section individually or all at once
7. Take screenshot of results

---

## 🎯 What to Do Next

### Step 1: Run the Quick Check
```bash
node scripts/db-quick-check.js 2>&1 | tee db-check-results.log
```

### Step 2: Share the Output
Send me the log file - I'll analyze it for:
- Missing admin user
- Missing forum categories
- Hardcoded values
- Orphaned records
- Data quality issues

### Step 3: I'll Create Fixes
Based on the output, I'll create SQL scripts to:
- Create admin user (if needed)
- Initialize forum categories (if needed)
- Create missing user profiles (if needed)
- Clean up orphaned records (if needed)

---

## 📊 Expected Output Sections

When you run `db-quick-check.js`, you'll see:

```
╔════════════════════════════════════════════════════════════════════════════╗
║              ECLIP DATABASE QUICK HEALTH CHECK
║                        2025-12-12T15:30:00.000Z
╚════════════════════════════════════════════════════════════════════════════╝

🔌 Connecting to Neon database...

✅ Connected successfully!

📊 Database Information:
  Database: eclip_db
  User: postgres
  Server Time: 2025-12-12 15:30:00

═══════════════════════════════════════════════════════════════════════════
📈 DATA STATISTICS
═══════════════════════════════════════════════════════════════════════════

  ✓ Users                    : 42
  ❌ Admins                  : 0          <-- CRITICAL!
  ✓ Email Verified          : 38
  ✓ Active Sessions         : 5
  ✓ Expired Sessions        : 12
  ✓ Matches                 : 156
  ✓ Forum Threads           : 8
  ❌ Forum Categories        : 0          <-- CRITICAL!
  ✓ Cosmetics               : 24
  ✓ User Profiles           : 42

[... more output ...]

💡 RECOMMENDATIONS

  ❌ CRITICAL: Create an admin user for system management
  ❌ CRITICAL: Initialize forum categories
  ✅ Database is otherwise healthy
```

---

## 🐛 Troubleshooting

### ❌ "DATABASE_URL not set"
**Solution:** Make sure `.env.local` exists with your Neon connection string

### ❌ "Cannot connect to database"
**Solution:** Check that:
1. Your `.env.local` has the correct DATABASE_URL
2. Your internet connection works
3. Neon project is active (not paused)

### ❌ "Module not found: 'pg'"
**Solution:** Install dependencies first:
```bash
npm install
```

### ❌ "TypeScript errors" in full-audit
**Solution:** Run this to install TypeScript:
```bash
npm install --save-dev typescript
```

---

## 📁 Files Created

- `scripts/db-quick-check.js` - Node.js database checker
- `scripts/run-audit.js` - Comprehensive database audit
- `scripts/full-audit.sh` - Linux/Mac full system audit
- `scripts/full-audit.bat` - Windows full system audit
- `DATABASE_AUDIT.sql` - Raw SQL for manual Neon dashboard checks

---

## ✅ Checklist for You

- [ ] Run `node scripts/db-quick-check.js` and save output
- [ ] Review the recommendations section
- [ ] Share the log file with me
- [ ] I'll analyze and create fix scripts
- [ ] We'll apply fixes to database
- [ ] Verify everything works

---

## 🎬 Example Command Sequences

**Linux/Mac - Complete workflow:**
```bash
# 1. Install dependencies
npm install

# 2. Run quick check and save output
node scripts/db-quick-check.js 2>&1 | tee db-check-results.log

# 3. Run full audit (optional)
bash scripts/full-audit.sh 2>&1 | tee full-audit-results.log

# 4. Share the logs
# Upload db-check-results.log and full-audit-results.log to share with support
```

**Windows - Complete workflow:**
```batch
# 1. Install dependencies
npm install

# 2. Run quick check and save output
node scripts/db-quick-check.js > db-check-results.txt 2>&1

# 3. Run full audit (optional)
cmd /c scripts/full-audit.bat > full-audit-results.txt 2>&1

# 4. Share the logs
# Upload db-check-results.txt and full-audit-results.txt to share with support
```

---

**Once you run these and share the output, I can immediately:**
- Identify any data issues
- Create fix SQL scripts
- Update the codebase if needed
- Verify everything works

Let me know when you run them! 🚀
