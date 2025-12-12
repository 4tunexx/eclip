# 🔍 COMPREHENSIVE DATABASE AUDIT REPORT
**Generated:** December 11, 2025  
**Database:** NEON PostgreSQL (us-east-1)  
**Status:** ⚠️ SCHEMA MISMATCHES FOUND

---

## 📊 EXECUTIVE SUMMARY

### Current State
✅ **30 tables** found in database
✅ **All critical tables exist** and are functional
⚠️ **2 EXTRA tables** not in Drizzle schema
⚠️ **Multiple column-level mismatches** between code and DB
⚠️ **Timestamp inconsistencies** (WITH vs WITHOUT timezone)
⚠️ **Missing column in users table** (level_computed)

### Risk Level: **MEDIUM** 
- No data loss risk
- Schema is functional but not fully aligned
- Some features may have timezone-related bugs
- Extra tables should be incorporated into schema

---

## 🔴 CRITICAL FINDINGS

### 1. EXTRA TABLES NOT IN DRIZZLE SCHEMA
```
Database has these, but Drizzle doesn't define them:
├── anti_cheat_logs (0 rows)
│   - Likely duplicate of ac_events?
│   - Has: id, user_id, match_id, code, severity, details, 
│          reviewed, reviewed_by, reviewed_at, status (EXTRA!)
│   - NOT DEFINED in src/lib/db/schema.ts
│
└── user_missions (0 rows)
    - Looks like duplicate of user_mission_progress?
    - Has: id, user_id, mission_id with unique constraint
    - NOT DEFINED in src/lib/db/schema.ts
```

**ACTION REQUIRED:** Add these tables to schema.ts or document why they exist

### 2. MISSING COLUMN IN USERS TABLE
```
Database has:
  - level_computed: integer (GENERATED ALWAYS AS calculate_level_from_xp(xp))

Drizzle schema missing this column!

Risk: This is a computed/generated column - any code trying to write 
to it will fail. Need to either:
  - Add it to schema (read-only)
  - OR remove the generated column from DB
```

### 3. TIMESTAMP TIMEZONE INCONSISTENCIES
```
Code expects timezone info (timestamp WITH time zone):
  - sessions.expiresAt
  - matches.startedAt, endedAt
  - forum_threads timestamps
  - notifications.createdAt
  - user_achievements.unlockedAt

But database has MIXED usage:
  ✅ WITH time zone:
     - user_achievements.unlocked_at ✓
     - forum_posts timestamps ✓
     - forum_threads timestamps ✓
     - sessions timestamps ✓

  ❌ WITHOUT time zone:
     - chat_messages.created_at ❌
     - cosmetics.created_at, updated_at ❌
     - badges.created_at, updated_at ❌
     - esr_thresholds.created_at ❌
     - forum_categories.created_at ❌
     - level_thresholds.created_at ❌
     - missions.created_at, updated_at ❌
     - role_permissions.created_at ❌
     - user_mission_progress.created_at, updated_at ❌

Risk: May cause timezone-related bugs when filtering/comparing timestamps
```

### 4. ENUM TYPE MISMATCHES
```
Drizzle defines:
  - cosmetic_type: ['Frame', 'Banner', 'Badge', 'Title']
  - rarity: ['Common', 'Rare', 'Epic', 'Legendary']

But database also has separate enums:
  - CosmeticType: [AVATAR_FRAME, PROFILE_BANNER, BADGE, TITLE] (different values!)
  - CosmeticRarity: [COMMON, RARE, EPIC, LEGENDARY] (uppercase)

Risk: Some columns using text, some using enum type
```

---

## 📋 DETAILED FINDINGS BY TABLE

### ✅ GOOD TABLES (Schema matches DB)
```
- sessions
- users (except level_computed missing)
- user_profiles
- user_inventory
- match_players
- queue_tickets
- achievements
- user_achievements
- forum_categories
- forum_threads
- forum_posts
- bans
- site_config
- transactions
- achievement_progress
- role_permissions
```

### ⚠️ TABLES WITH ISSUES

#### 1. `cosmetics` table
```
Issue: Timestamp columns don't specify timezone
Drizzle expects:
  - createdAt: timestamp('created_at').defaultNow().notNull()
  
DB has:
  - created_at: timestamp DEFAULT now()  (WITHOUT time zone)
  - updated_at: timestamp DEFAULT now()  (WITHOUT time zone)

Action: Either update Drizzle or update DB column types
```

#### 2. `chat_messages` table
```
Issue: created_at without timezone
DB: created_at timestamp DEFAULT now() NOT NULL
Drizzle: createdAt: timestamp('created_at').defaultNow().notNull()

Risk: Timezone-related sorting issues
```

#### 3. `missions` table
```
Issue: Timestamps don't have timezone info
DB Actual:
  - created_at: timestamp DEFAULT CURRENT_TIMESTAMP
  - updated_at: timestamp DEFAULT CURRENT_TIMESTAMP
  
Drizzle Expects:
  - createdAt with timezone
  - updatedAt with timezone

Code impact: Filtering by date range may fail
```

#### 4. `badges` table
```
Issue: Timestamps without timezone
DB: created_at/updated_at are timestamp (no tz)
Drizzle: expects timestamp with defaultNow()

```

#### 5. `esr_thresholds` table
```
Issue: Column order mismatch
DB order:
  - id, tier, min_esr, max_esr, color, created_at, division

Drizzle order:
  - id, tier, division, min_esr, max_esr, color, created_at

Note: Drizzle has division BEFORE min/max_esr in definition
```

#### 6. `acEvents` table (actually `ac_events`)
```
Issue: created_at is WITH time zone (good!)
But status column exists in anti_cheat_logs but NOT in ac_events

Data is in ac_events (10 columns), not anti_cheat_logs (10 columns)
```

---

## 📊 TABLE STATISTICS

| Table | Rows | Status |
|-------|------|--------|
| users | 16 | ✅ Active |
| missions | 55 | ✅ Active |
| achievements | 50 | ✅ Active |
| badges | 50 | ✅ Active |
| cosmetics | 38 | ✅ Active |
| esr_thresholds | 15 | ✅ Active |
| level_thresholds | 100 | ✅ Active |
| sessions | 6 | ✅ Active |
| forum_categories | 3 | ✅ Active |
| user_profiles | 1 | ✅ Active |
| user_inventory | 5 | ✅ Active |
| notifications | 5 | ✅ Active |
| transactions | 5 | ✅ Active |
| matches | 1 | ⚠️ Low usage |
| chat_messages | 1 | ⚠️ Low usage |
| user_achievements | 2 | ⚠️ Low usage |
| user_mission_progress | 1 | ⚠️ Low usage |
| **EMPTY** | 0 | ⚠️ |
| ac_events | 0 | - |
| anti_cheat_logs | 0 | - |
| achievement_progress | 0 | - |
| bans | 0 | - |
| direct_messages | 0 | - |
| forum_posts | 0 | - |
| match_players | 0 | - |
| queue_tickets | 3 | - |
| role_permissions | 38 | - |
| site_config | 0 | - |
| user_metrics | 0 | - |
| user_missions | 0 | - |

---

## 🔧 CODEBASE ISSUES FOUND

### 1. Missing Schema Definition
These tables exist in DB but aren't exported from schema.ts:
```typescript
// MISSING from src/lib/db/schema.ts:
- anti_cheat_logs
- user_missions
```

### 2. Potential Runtime Issues
```typescript
// In src/app/api/shop/equip/route.ts (line 83):
const frameCol = set.has('equipped_frame_id') ? 'equipped_frame_id' : 'equippedFrameId'
// This suggests column name uncertainty - schema mismatch!
```

### 3. Script-Based Table Creation
Multiple scripts create tables outside migrations:
- `/scripts/setup-chat-table.ts` - Creates chat_messages table
- `/scripts/setup-chat-table.js` - Same in JavaScript
- These bypass Drizzle schema tracking!

**Risk:** Table definitions not version-controlled in migrations

---

## 🛠️ REQUIRED FIXES

### PRIORITY 1: CRITICAL
```
1. Add anti_cheat_logs table to schema.ts
   - File: src/lib/db/schema.ts
   - Create export const acLogs or antiCheatLogs

2. Add user_missions table to schema.ts
   - File: src/lib/db/schema.ts
   - Create export const userMissions

3. Add level_computed column to users table
   - Either add as computed/generated column in schema
   - OR update Drizzle to include it (read-only)
```

### PRIORITY 2: HIGH
```
4. Fix timestamp timezone inconsistencies
   Tables needing UPDATE:
   - chat_messages: Add WITH TIME ZONE
   - cosmetics: Add WITH TIME ZONE
   - badges: Add WITH TIME ZONE
   - esr_thresholds: Add WITH TIME ZONE
   - forum_categories: Add WITH TIME ZONE
   - level_thresholds: Add WITH TIME ZONE
   - missions: Add WITH TIME ZONE
   - role_permissions: Add WITH TIME ZONE
   - user_mission_progress: Add WITH TIME ZONE

   Option A: Alter in DB (production fix)
   Option B: Create migration to fix all at once
```

### PRIORITY 3: MEDIUM
```
5. Reconcile duplicate table situation
   - anti_cheat_logs vs ac_events: Which is primary?
   - user_missions vs user_mission_progress: Which is primary?
   - Decide and document

6. Consolidate table creation methods
   - Remove inline table creation from scripts
   - Use migrations for all schema changes
   - Move chat_messages setup to migration
```

### PRIORITY 4: LOW
```
7. Update enum type usage
   - Decide: Use PostgreSQL enums or TEXT columns?
   - Current: Mixed approach causes confusion
   
8. Reorder esr_thresholds columns in Drizzle
   - Match DB column order exactly
```

---

## 📝 MIGRATION STEPS

### Step 1: Backup Current Data
```bash
# Export all data for safety
npm run db:backup
```

### Step 2: Add Missing Tables to Schema
```typescript
// src/lib/db/schema.ts - ADD THESE:

export const antiCheatLogs = pgTable('anti_cheat_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  severity: integer('severity').notNull(),
  details: jsonb('details'),
  reviewed: boolean('reviewed').default(false),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userMissions = pgTable('user_missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  missionId: uuid('mission_id').references(() => missions.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Step 3: Create Migration for Timezone Fixes
```sql
-- drizzle/0008_fix_timezones.sql
ALTER TABLE chat_messages ALTER COLUMN created_at TYPE timestamp with time zone;
ALTER TABLE cosmetics ALTER COLUMN created_at TYPE timestamp with time zone;
ALTER TABLE cosmetics ALTER COLUMN updated_at TYPE timestamp with time zone;
-- ... etc for all tables
```

### Step 4: Test Everything
```bash
npm run test:db
npm run verify:db
```

---

## 🔍 VERIFICATION CHECKLIST

- [ ] All 30 tables accounted for
- [ ] No undefined table references in code
- [ ] All timestamps use WITH TIME ZONE (or document exceptions)
- [ ] Drizzle schema matches database exactly
- [ ] All migrations are in migrations/ folder
- [ ] No inline SQL table creation outside migrations
- [ ] anti_cheat_logs and user_missions documented
- [ ] Duplicate functionality resolved (logs vs events, missions tables)
- [ ] Test all timestamp-based queries work correctly
- [ ] Verify timezone handling in production

---

## 📚 DOCUMENTATION FILES AFFECTED

These files reference database schema and may need updating:
- `src/lib/db/schema.ts` - Main source of truth
- `COMPLETE_SCHEMA_GUIDE.md` - Documentation
- `DATABASE_SETUP_CHECKLIST.md` - Setup guide
- `NEON_QUICK_PASTE.sql` - Quick migration
- `DATABASE_MIGRATION_READY.md` - Migration guide

---

## ✅ SUMMARY

**Tables:** 30 found, all functional
**Critical Issues:** 2 (extra tables not in schema)
**High Priority:** Timestamp inconsistencies (9 tables)
**Medium Priority:** Duplicate table resolution
**Action Timeline:** 
- Critical: This sprint
- High: Next sprint
- Medium/Low: Backlog

**Recommendation:** Start with Priority 1 fixes, then address timestamp consistency across all tables.
