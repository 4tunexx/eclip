# 🎯 Daily Login Mission Setup

## The Problem
The script keeps failing due to environment/terminal issues. No problem - here's the manual fix.

## The Solution
Copy and paste this SQL directly into your Neon database console.

### Step 1: Open Neon Console
1. Go to https://console.neon.tech
2. Find your project "eclip"
3. Click "SQL Editor"
4. Create new query

### Step 2: Paste This SQL

```sql
INSERT INTO missions (
  name,
  description,
  category,
  requirement_type,
  requirement_value,
  target,
  reward_xp,
  reward_coins,
  is_active,
  created_at,
  updated_at
) VALUES (
  'Daily Login Bonus',
  'Login to Eclip.pro every day to claim your daily reward!',
  'DAILY',
  'DAILY_LOGIN',
  1,
  1,
  50,
  25,
  true,
  NOW(),
  NOW()
) ON CONFLICT (name) DO UPDATE SET
  updated_at = NOW();
```

### Step 3: Execute
Click "Execute" button and you're done! ✅

---

## Verify It Works

Run this query to confirm:

```sql
SELECT id, name, requirement_type, target, reward_xp, reward_coins 
FROM missions 
WHERE requirement_type = 'DAILY_LOGIN';
```

You should see:
- **name**: Daily Login Bonus
- **requirement_type**: DAILY_LOGIN
- **target**: 1
- **reward_xp**: 50
- **reward_coins**: 25

---

## What This Does

When users login:
1. ✅ Daily login endpoint automatically triggers
2. ✅ Mission progress increases by 1
3. ✅ When progress reaches 1 (target), mission completes
4. ✅ 50 XP + 25 coins automatically granted
5. ✅ User sees it in `/missions` page

---

## Alternative: Via psql CLI

If you prefer command line:

```bash
psql $DATABASE_URL -c "
INSERT INTO missions (name, description, category, requirement_type, requirement_value, target, reward_xp, reward_coins, is_active, created_at, updated_at)
VALUES ('Daily Login Bonus', 'Login to Eclip.pro every day to claim your daily reward!', 'DAILY', 'DAILY_LOGIN', 1, 1, 50, 25, true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET updated_at = NOW();
"
```

Replace `$DATABASE_URL` with your actual connection string.

---

## The Code is Ready

The daily login tracking code is already implemented:
- ✅ `/src/app/api/user/daily-login/route.ts` - Tracking endpoint
- ✅ `/src/app/api/auth/me/route.ts` - Triggers on every visit
- ✅ `/src/lib/constants/requirement-types.ts` - DAILY_LOGIN type defined
- ✅ Mission system - Ready to track progress

All you need is to create the mission in the database!
