# 🔍 DATABASE SCHEMA MISMATCH - FIXED!

## THE PROBLEM

The codebase schema didn't match the actual database schema. This caused:
1. The daily login script to fail with column mismatch errors
2. API endpoints trying to use wrong column names
3. TypeScript schema definitions being incorrect

---

## ACTUAL DATABASE SCHEMA (from `drizzle/0000_flippant_trish_tilby.sql`)

### missions table

```sql
CREATE TABLE "missions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "type" "mission_type" NOT NULL,              -- 'DAILY', 'WEEKLY', 'ACHIEVEMENT'
  "objective_type" text NOT NULL,              -- 'daily_login', 'kill_count', etc.
  "objective_value" integer NOT NULL,          -- numeric value for the objective
  "reward_xp" integer DEFAULT 0,
  "reward_coins" numeric(10, 2) DEFAULT '0',
  "reward_cosmetic_id" uuid,
  "is_active" boolean DEFAULT true NOT NULL,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

### user_mission_progress table

```sql
CREATE TABLE "user_mission_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "mission_id" uuid NOT NULL,
  "progress" integer DEFAULT 0 NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

---

## WHAT WAS WRONG IN CODEBASE

### ❌ schema.ts had WRONG columns:
```typescript
// WRONG - these columns don't exist in actual DB!
category: text('category')
requirementType: text('requirement_type')
requirementValue: text('requirement_value')
target: integer('target')
isDaily: boolean('is_daily')
```

### ✅ FIXED to match actual DB:
```typescript
type: missionTypeEnum('type')          // mission_type enum
objectiveType: text('objective_type')  // what to track
objectiveValue: integer('objective_value')  // how much
```

---

## FIXES APPLIED

### 1. `/src/lib/db/schema.ts`
- ✅ Updated missions table definition to match actual DB schema
- ✅ Now uses correct column names: type, objectiveType, objectiveValue
- ✅ Removed fake columns: category, requirementType, target, isDaily

### 2. `/apply-daily-login.js`
- ✅ Fixed SQL INSERT to use actual database columns
- ✅ Uses: title, description, type, objective_type, objective_value
- ✅ Correct values for daily login: type='DAILY', objectiveType='daily_login', objectiveValue=1

### 3. Any API files using missions
- ⚠️ Need to check and update to use correct column names
- Files to check:
  - `/src/app/api/missions/route.ts`
  - `/src/app/api/missions/progress/route.ts`
  - `/src/app/api/admin/missions/route.ts`
  - `/src/app/(app)/admin/missions/page.tsx`

---

## CORRECTED SQL FOR DAILY LOGIN MISSION

```sql
INSERT INTO missions (
  title,
  description,
  type,
  objective_type,
  objective_value,
  reward_xp,
  reward_coins,
  is_active,
  created_at,
  updated_at
) VALUES (
  'Daily Login Bonus',
  'Login to Eclip.pro every day to claim your daily reward!',
  'DAILY',
  'daily_login',
  1,
  50,
  25,
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;
```

---

## DATABASE vs CODEBASE COMPARISON

| Column | Actual DB | schema.ts (was) | schema.ts (now) |
|--------|-----------|-----------------|-----------------|
| title | ✅ | ✅ | ✅ |
| description | ✅ | ✅ | ✅ |
| type | ✅ ENUM | ❌ missing | ✅ |
| objective_type | ✅ | ❌ requirementType | ✅ |
| objective_value | ✅ | ❌ requirementValue | ✅ |
| reward_xp | ✅ | ✅ | ✅ |
| reward_coins | ✅ | ✅ | ✅ |
| is_active | ✅ | ✅ | ✅ |
| category | ❌ WRONG | ✅ (wrong) | ❌ removed |
| target | ❌ WRONG | ✅ (wrong) | ❌ removed |
| is_daily | ❌ WRONG | ✅ (wrong) | ❌ removed |

---

## NEXT STEPS

1. ✅ Fixed schema.ts
2. ✅ Fixed apply-daily-login.js
3. ⚠️ TODO: Check and fix API files that use missions table

### Check these files:

**File**: `/src/app/api/missions/route.ts`
- Look for: references to `missions.category`, `missions.target`, `missions.requirementType`
- Replace with: `missions.type`, `missions.objectiveType`, `missions.objectiveValue`

**File**: `/src/app/api/missions/progress/route.ts`
- Check for same issues

**File**: `/src/app/api/admin/missions/route.ts`
- Check for same issues

**File**: `/src/app/(app)/admin/missions/page.tsx`
- Check for same issues

---

## CRITICAL: Never Ignore Database Migrations!

The actual database schema comes from:
- `/drizzle/0000_flippant_trish_tilby.sql` - **SOURCE OF TRUTH**

All code must align with this, not the other way around!

---

## Test the Fix

Run this to verify:
```bash
node apply-daily-login.js
```

Should now work! ✅
