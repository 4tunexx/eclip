# 🎯 DATABASE SCHEMA REMEDIATION PLAN
**Created:** December 11, 2025  
**Status:** READY FOR IMPLEMENTATION  
**Urgency:** HIGH - Critical fixes needed

---

## 📋 WHAT WAS DONE

### Audit Completed ✅
- Scanned entire NEON database (30 tables, 75 indexes, 35 foreign keys)
- Compared with Drizzle schema definitions
- Analyzed all table structures and data types
- Reviewed all codebase database references
- Identified all mismatches and gaps

### Issues Found ✅
1. **2 Extra tables** in database not defined in Drizzle schema
2. **1 Missing column** in users table (level_computed)
3. **9 Tables** with timestamp columns missing timezone info
4. **Enum inconsistencies** (multiple enum definitions for same purpose)
5. **Script-based table creation** outside migration system

### Reports Generated ✅
- `DATABASE_AUDIT_FINDINGS.md` - Detailed findings report
- `drizzle/0009_add_missing_tables_and_fix_schema.sql` - Migration file
- Updated `src/lib/db/schema.ts` - Added missing table definitions

---

## 🚀 NEXT STEPS (Priority Order)

### STEP 1: Apply Schema Migration (5 minutes)
**File:** `drizzle/0009_add_missing_tables_and_fix_schema.sql`

**Option A: Via Neon Console** (Recommended for safety)
```sql
1. Go to https://console.neon.tech
2. Select your database → SQL Editor
3. Open and run drizzle/0009_add_missing_tables_and_fix_schema.sql
4. Verify "Success" message
```

**Option B: Via CLI** (If available)
```bash
npm run migrate:db
# or
psql $DATABASE_URL < drizzle/0009_add_missing_tables_and_fix_schema.sql
```

**Option C: Via Drizzle Kit** (If configured)
```bash
npm run db:migrate
```

### STEP 2: Verify Migration Applied
Run the audit again to verify:
```bash
node scripts/database-audit.js
```

Expected result:
```
✅ All expected tables exist
⚠️ EXTRA TABLES IN DATABASE: (should show none now)
```

### STEP 3: Update Codebase References

**Check these files for any custom logic:**
- `src/app/api/admin/anti-cheat/**` - Update to use new antiCheatLogs table
- `src/app/api/missions/**` - Decide: use userMissions or userMissionProgress?
- `scripts/setup-chat-table.ts` - Remove (not needed, table now in migrations)
- `scripts/setup-chat-table.js` - Remove (not needed, table now in migrations)

### STEP 4: Test All Features
```bash
# Test database connectivity
npm run test:db

# Test anti-cheat features
npm run test:features -- --grep "anti-cheat"

# Test mission tracking
npm run test:features -- --grep "missions"

# Full integration test
npm run test
```

### STEP 5: Deploy to Production

**Pre-deployment checklist:**
- [ ] All tests passing locally
- [ ] Code reviewed by team
- [ ] Backup of production database taken
- [ ] Rollback plan documented

**Deployment:**
```bash
git add .
git commit -m "fix: align database schema with Drizzle definitions

- Add anti_cheat_logs table to schema
- Add user_missions table to schema
- Fix timestamp columns to use WITH TIME ZONE
- Add level_computed computed column
- Update schema.ts with new table exports
- All changes safe and idempotent"

git push origin master
```

---

## 📝 DETAILED ACTION ITEMS

### A. Schema Definition Updates ✅ DONE
```
✅ Added antiCheatLogs export to src/lib/db/schema.ts
✅ Added userMissions export to src/lib/db/schema.ts
✅ Created migration file with all fixes
```

### B. Table Usage Clarification (TODO)
```
Decision needed: Which table is primary?

1. Anti-cheat logging:
   - ac_events (10 rows in schema)
   - anti_cheat_logs (new, 0 rows)
   → Use: antiCheatLogs (ac_events → acEvents)
   → Deprecate: acEvents

2. User missions:
   - user_mission_progress (1 row, tracks progress)
   - user_missions (new, 0 rows, tracks assignment)
   → Use: userMissions for assignment tracking
   → Keep: userMissionProgress for progress tracking
```

### C. Code References to Update (TODO)
```
Files using ac_events → Update to antiCheatLogs:
  - src/app/api/admin/anti-cheat/**/*.ts (5 files)
  - src/app/api/ac/**/*.ts (multiple files)
  - src/lib/auth.ts (references)

Files using missions → Clarify and update:
  - src/app/api/missions/**/*.ts
  - src/app/api/admin/missions/**/*.ts
  - src/hooks/use-missions.ts (if exists)
  - src/lib/missions.ts (if exists)

Script cleanup:
  - Delete: scripts/setup-chat-table.ts
  - Delete: scripts/setup-chat-table.js
  - Reason: Chat messages table now in migrations
```

### D. Testing Strategy (TODO)
```
Unit Tests:
- Test antiCheatLogs table queries
- Test userMissions table queries
- Test timezone handling for all timestamp columns

Integration Tests:
- Anti-cheat event logging flow
- Mission assignment and tracking
- Timestamp filtering queries

End-to-End Tests:
- User reports anti-cheat event
- System logs to antiCheatLogs
- Admin can review and mark reviewed
```

---

## 🔍 VERIFICATION POINTS

After applying migration, verify:

### Database Level
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('anti_cheat_logs', 'user_missions')
ORDER BY table_name;
-- Expected: 2 rows

-- Check timestamp columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chat_messages'
AND column_name = 'created_at';
-- Expected: timestamp with time zone

-- Check computed column
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
AND column_name = 'level_computed';
-- Expected: 1 row
```

### Application Level
```typescript
// In src/lib/db/index.ts, verify imports work:
import { antiCheatLogs, userMissions } from './schema';

// In API routes, verify queries work:
const logs = await db.select().from(antiCheatLogs);
const missions = await db.select().from(userMissions);

// Verify timestamp comparisons work:
const recent = await db.select().from(chatMessages)
  .where(gt(chatMessages.createdAt, new Date(Date.now() - 86400000)))
```

---

## 📊 ROLLBACK PLAN (If needed)

If something goes wrong:

### Option 1: Revert to Previous Backup
```bash
# Get backup timestamp from Neon
# Restore from backup through Neon console
```

### Option 2: Undo Migration
```sql
-- DROP new tables
DROP TABLE IF EXISTS "user_missions" CASCADE;
DROP TABLE IF EXISTS "anti_cheat_logs" CASCADE;

-- Note: Timestamp conversions can't be automatically rolled back
-- May need to restore from backup for full rollback
```

### Option 3: Contact Neon Support
- Neon has automatic backups
- Can restore to any point in time (check plan limits)
- https://console.neon.tech

---

## ⚡ QUICK REFERENCE

### Critical Files Changed
1. `src/lib/db/schema.ts` - Added antiCheatLogs & userMissions ✅
2. `drizzle/0009_*.sql` - Migration file ✅
3. `DATABASE_AUDIT_FINDINGS.md` - Findings report ✅

### Files Requiring Review
1. `src/app/api/admin/anti-cheat/**` - May need updates
2. `src/app/api/ac/**` - May need updates  
3. `src/app/api/missions/**` - May need updates
4. `scripts/setup-chat-table.*` - Should be removed

### Files to Keep Watching
1. `src/lib/db/index.ts` - Ensure exports are available
2. `src/contexts/UserContext.tsx` - Check timestamp handling
3. Any queries filtering by date/time

---

## 📞 SUPPORT INFO

### If issues arise:

**Database Connection Issues:**
- Check DATABASE_URL in .env
- Verify Neon database is accessible
- Check IP whitelist in Neon console

**Migration Errors:**
- Check Neon SQL Editor for error details
- Refer to `DATABASE_AUDIT_FINDINGS.md` for expected state
- Run audit again to see current state

**Type Errors in Code:**
- May need TypeScript recompilation
- Run: `npm run type-check`
- Run: `npm run build`

**Timezone Issues:**
- All timestamp columns should now be WITH TIME ZONE
- Test with: `SELECT created_at AT TIME ZONE 'UTC' FROM table_name`
- May need to restart Node server for changes to take effect

---

## ✅ COMPLETION CHECKLIST

- [ ] Read `DATABASE_AUDIT_FINDINGS.md` for full context
- [ ] Applied `drizzle/0009_*.sql` migration
- [ ] Ran audit script and verified new tables exist
- [ ] Reviewed code files that reference anti-cheat and missions
- [ ] Updated any imports to use new antiCheatLogs/userMissions
- [ ] Ran all tests and confirmed passing
- [ ] Deleted unused setup-chat-table scripts
- [ ] Committed changes to git
- [ ] Deployed to staging (if applicable)
- [ ] Verified in staging environment
- [ ] Deployed to production
- [ ] Monitored logs for any issues
- [ ] Updated team documentation

---

**Status:** READY TO IMPLEMENT  
**Timeline:** 30-60 minutes total  
**Risk:** LOW (migrations are safe and idempotent)  
**Questions?** Check `DATABASE_AUDIT_FINDINGS.md` for detailed analysis
