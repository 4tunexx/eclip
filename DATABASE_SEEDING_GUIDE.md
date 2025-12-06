# Database Data Integrity & Seeding Guide

## Overview

This guide helps verify that all database tables contain the necessary data for the platform to function correctly. It includes SQL queries to check each table and recommendations for seed data.

---

## Database Connection

```bash
psql 'postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

---

## Table-by-Table Verification Guide

### 1. USERS TABLE

**Purpose:** Store user account information

**Required Fields:**
- id (UUID, auto-generated)
- username (unique, not null)
- email (unique)
- steam_id (required for authentication)
- level (default: 1)
- xp (default: 0)
- esr (default: 1000)
- rank (default: 'Bronze')
- role (default: 'USER')

**Verification Query:**
```sql
-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Check users with ranks
SELECT id, username, rank, esr, level, role FROM users LIMIT 10;

-- Check admin users
SELECT COUNT(*) as admin_count FROM users WHERE role = 'ADMIN';

-- Check data distribution
SELECT role, COUNT(*) as count FROM users GROUP BY role;
```

**Expected Data:**
- At least 1 admin user (role = 'ADMIN')
- At least 10 regular users for testing
- Varied ranks and ESR values
- At least 1 user with VIP role

---

### 2. ACHIEVEMENTS TABLE

**Purpose:** Define available achievements

**Required Fields:**
- id (UUID)
- name (not null)
- description (not null)
- category (LEVEL, ESR, COMBAT, SOCIAL, PLATFORM, COMMUNITY)
- target (numeric goal)
- requirement_type (e.g., 'kill_count', 'level', etc)
- reward_xp (points earned)
- is_active (boolean)

**Verification Query:**
```sql
-- Count achievements by category
SELECT category, COUNT(*) as count FROM achievements GROUP BY category;

-- List all active achievements
SELECT name, category, target, reward_xp FROM achievements WHERE is_active = true;

-- Check if rewards are set
SELECT COUNT(*) as achievements_with_rewards FROM achievements WHERE reward_xp > 0;

-- Verify sample achievements
SELECT name, category, target FROM achievements LIMIT 20;
```

**Expected Data:**
- Minimum 3-5 achievements per category
- At least 20 total achievements
- All achievements should have reward_xp > 0
- Mix of easy and hard achievements
- Some secret achievements (is_secret = true)

**Recommended Achievements to Create:**
```json
[
  { "name": "First Blood", "category": "COMBAT", "target": 1, "type": "first_kill" },
  { "name": "Headshot Master", "category": "COMBAT", "target": 100, "type": "headshot_kills" },
  { "name": "Climb to Gold", "category": "ESR", "target": 1600, "type": "esr_threshold" },
  { "name": "Level 10", "category": "LEVEL", "target": 10, "type": "level_reach" },
  { "name": "Social Butterfly", "category": "SOCIAL", "target": 5, "type": "forum_posts" },
  { "name": "Platform Player", "category": "PLATFORM", "target": 50, "type": "matches_played" }
]
```

---

### 3. USER_ACHIEVEMENTS TABLE

**Purpose:** Track user achievement progress and unlocks

**Required Fields:**
- id (UUID)
- user_id (references users)
- achievement_id (references achievements)
- progress (current progress toward achievement)
- unlocked_at (timestamp when unlocked, NULL if not unlocked)

**Verification Query:**
```sql
-- Count unlocked achievements per user
SELECT user_id, COUNT(*) as unlocked_count 
FROM user_achievements 
WHERE unlocked_at IS NOT NULL 
GROUP BY user_id 
ORDER BY unlocked_count DESC;

-- Check total achievement records
SELECT COUNT(*) as total_progress_records FROM user_achievements;

-- Verify users have achievement opportunities
SELECT COUNT(DISTINCT user_id) as users_with_achievements FROM user_achievements;

-- Check progress distribution
SELECT progress, COUNT(*) as count FROM user_achievements GROUP BY progress;
```

**Expected Data:**
- Each test user should have 5-20 achievement records
- Mix of locked and unlocked achievements
- Varied progress levels (some in-progress, some complete)

---

### 4. MISSIONS TABLE

**Purpose:** Define daily, weekly, and special missions

**Required Fields:**
- id (UUID)
- title (not null)
- description (not null)
- category (DAILY, PLATFORM, INGAME)
- is_daily (boolean, true for daily reset)
- target (numeric goal)
- reward_xp (points earned)
- reward_coins (currency earned)
- is_active (boolean)

**Verification Query:**
```sql
-- Count missions by type
SELECT is_daily, COUNT(*) as count FROM missions GROUP BY is_daily;

-- List active missions
SELECT title, category, target, reward_xp, reward_coins FROM missions WHERE is_active = true;

-- Check reward distribution
SELECT AVG(reward_xp) as avg_xp, AVG(reward_coins) as avg_coins FROM missions;

-- Count missions by category
SELECT category, COUNT(*) as count FROM missions GROUP BY category;
```

**Expected Data:**
- At least 5 daily missions (is_daily = true)
- At least 3 weekly missions (is_daily = false)
- All active missions should have clear descriptions
- Rewards should be reasonable (XP: 100-500, Coins: 50-250)

**Recommended Missions to Create:**
```json
[
  { "title": "Win 1 Match", "category": "DAILY", "is_daily": true, "target": 1, "reward_xp": 100 },
  { "title": "Get 10 Kills", "category": "DAILY", "is_daily": true, "target": 10, "reward_xp": 150 },
  { "title": "Weekly Warrior", "category": "PLATFORM", "is_daily": false, "target": 10, "reward_xp": 500 },
  { "title": "MVP 5 Times", "category": "INGAME", "is_daily": true, "target": 5, "reward_xp": 200 }
]
```

---

### 5. USER_MISSION_PROGRESS TABLE

**Purpose:** Track user progress on missions

**Required Fields:**
- id (UUID)
- user_id (references users)
- mission_id (references missions)
- progress (current progress)
- completed (boolean)
- completed_at (timestamp if completed)

**Verification Query:**
```sql
-- Count completed missions
SELECT COUNT(*) as completed_count FROM user_mission_progress WHERE completed = true;

-- Check mission completion rate
SELECT mission_id, COUNT(*) as users, 
  SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
FROM user_mission_progress 
GROUP BY mission_id;

-- List user mission progress
SELECT u.username, m.title, ump.progress, ump.completed
FROM user_mission_progress ump
JOIN users u ON ump.user_id = u.id
JOIN missions m ON ump.mission_id = m.id
LIMIT 20;
```

**Expected Data:**
- Each user should have 5-10 active missions
- Some missions should be completed (completed = true)
- Progress values should vary from 0 to target

---

### 6. BADGES TABLE

**Purpose:** Define badge types and unlock conditions

**Required Fields:**
- id (UUID)
- name (not null)
- description (not null)
- category (string)
- rarity (Common, Rare, Epic, Legendary)
- unlock_type (how the badge is earned)

**Verification Query:**
```sql
-- Count badges by rarity
SELECT rarity, COUNT(*) as count FROM badges GROUP BY rarity;

-- List all badges
SELECT name, rarity, category FROM badges;

-- Check badge details
SELECT COUNT(*) as total_badges FROM badges;
```

**Expected Data:**
- At least 1-2 badge per rarity level
- At least 10 total badges
- Each badge should have unique name and description

**Recommended Badges:**
```json
[
  { "name": "First Win", "rarity": "Common", "category": "Achievement" },
  { "name": "Killing Spree", "rarity": "Rare", "category": "Combat" },
  { "name": "Gold Tier", "rarity": "Epic", "category": "Rank" },
  { "name": "Legend", "rarity": "Legendary", "category": "Special" }
]
```

---

### 7. COSMETICS TABLE

**Purpose:** Store shop items (frames, banners, badges, titles)

**Required Fields:**
- id (UUID)
- name (not null)
- type (Frame, Banner, Badge, Title)
- rarity (Common, Rare, Epic, Legendary)
- price (decimal, in coins)
- is_active (boolean)

**Verification Query:**
```sql
-- Count cosmetics by type
SELECT type, COUNT(*) as count FROM cosmetics GROUP BY type;

-- Count by rarity
SELECT rarity, COUNT(*) as count FROM cosmetics GROUP BY rarity;

-- Check pricing
SELECT type, rarity, AVG(CAST(price as DECIMAL)) as avg_price 
FROM cosmetics 
GROUP BY type, rarity;

-- List all active cosmetics
SELECT name, type, rarity, price FROM cosmetics WHERE is_active = true;
```

**Expected Data:**
- At least 5 cosmetics per type (20+ total)
- Prices: Common 100-200, Rare 200-500, Epic 500-1000, Legendary 1000+
- All cosmetics should have image_url set

---

### 8. USER_INVENTORY TABLE

**Purpose:** Track user-owned cosmetics

**Required Fields:**
- id (UUID)
- user_id (references users)
- cosmetic_id (references cosmetics)
- purchased_at (timestamp)

**Verification Query:**
```sql
-- Count total cosmetics owned
SELECT COUNT(*) as total_owned FROM user_inventory;

-- Cosmetics owned per user
SELECT user_id, COUNT(*) as cosmetics_owned 
FROM user_inventory 
GROUP BY user_id 
ORDER BY cosmetics_owned DESC;

-- Most popular cosmetics
SELECT cosmetic_id, COUNT(*) as owner_count
FROM user_inventory
GROUP BY cosmetic_id
ORDER BY owner_count DESC;

-- Users inventory by type
SELECT c.type, COUNT(*) as count
FROM user_inventory ui
JOIN cosmetics c ON ui.cosmetic_id = c.id
GROUP BY c.type;
```

**Expected Data:**
- Each test user should own 3-10 cosmetics
- Mix of different types and rarities
- Some cosmetics should be owned by multiple users

---

### 9. ESER_THRESHOLDS TABLE

**Purpose:** Define ranking tiers and divisions

**Required Fields:**
- id (UUID)
- tier (tier name: Bronze, Silver, Gold, Platinum, Diamond)
- division (1-4, where 1 is highest in tier)
- min_esr (minimum ESR for this tier/division)
- max_esr (maximum ESR for this tier/division)
- color (hex color code for display)

**Verification Query:**
```sql
-- List all tiers
SELECT tier, division, min_esr, max_esr, color 
FROM esr_thresholds 
ORDER BY min_esr DESC;

-- Count tiers and divisions
SELECT tier, COUNT(*) as division_count FROM esr_thresholds GROUP BY tier;

-- Verify ESR range coverage (should be continuous)
SELECT min_esr, max_esr FROM esr_thresholds ORDER BY min_esr;
```

**Expected Data:**
- 5 tiers (Bronze, Silver, Gold, Platinum, Diamond)
- 4 divisions per tier (20 total rows)
- ESR ranges should be continuous with no gaps
- Each tier should have unique color

**Standard ESR Ranges:**
```json
[
  { "tier": "Bronze", "divisions": [ [0, 1300], [1300, 1300], [1300, 1300], [1300, 1300] ] },
  { "tier": "Silver", "divisions": [ [1300, 1600], [1600, 1600], [1600, 1600], [1600, 1600] ] },
  { "tier": "Gold", "divisions": [ [1600, 1900], [1900, 1900], [1900, 1900], [1900, 1900] ] },
  { "tier": "Platinum", "divisions": [ [1900, 2200], [2200, 2200], [2200, 2200], [2200, 2200] ] },
  { "tier": "Diamond", "divisions": [ [2200, 5000], [5000, 5000], [5000, 5000], [5000, 5000] ] }
]
```

---

### 10. MATCHES TABLE

**Purpose:** Record match history

**Required Fields:**
- id (UUID)
- status (PENDING, READY, LIVE, FINISHED, CANCELLED)
- map (map name)
- score_team1, score_team2 (final scores)
- started_at, ended_at (timestamps)

**Verification Query:**
```sql
-- Count matches by status
SELECT status, COUNT(*) as count FROM matches GROUP BY status;

-- Count finished matches
SELECT COUNT(*) as finished_matches FROM matches WHERE status = 'FINISHED';

-- Average game duration
SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at))/60) as avg_duration_minutes
FROM matches WHERE status = 'FINISHED';

-- List recent matches
SELECT id, map, score_team1, score_team2, started_at 
FROM matches 
WHERE status = 'FINISHED' 
ORDER BY started_at DESC 
LIMIT 10;
```

**Expected Data:**
- At least 50 finished matches
- Various map names
- Score distribution should be realistic
- Timestamps should be reasonable

---

### 11. MATCH_PLAYERS TABLE

**Purpose:** Store individual player stats for each match

**Required Fields:**
- id (UUID)
- match_id (references matches)
- user_id (references users)
- team (1 or 2)
- kills, deaths, assists, mvps (statistics)
- is_winner (boolean)

**Verification Query:**
```sql
-- Count player records
SELECT COUNT(*) as total_player_records FROM match_players;

-- Average player stats
SELECT 
  AVG(kills) as avg_kills,
  AVG(deaths) as avg_deaths,
  AVG(assists) as avg_assists,
  AVG(mvps) as avg_mvps
FROM match_players;

-- Top fragging players
SELECT u.username, SUM(mp.kills) as total_kills
FROM match_players mp
JOIN users u ON mp.user_id = u.id
GROUP BY u.id, u.username
ORDER BY total_kills DESC
LIMIT 10;

-- Win rate calculation
SELECT 
  u.username,
  COUNT(*) as total_matches,
  SUM(CASE WHEN mp.is_winner = true THEN 1 ELSE 0 END) as wins,
  ROUND(100.0 * SUM(CASE WHEN mp.is_winner = true THEN 1 ELSE 0 END) / COUNT(*), 2) as win_rate
FROM match_players mp
JOIN users u ON mp.user_id = u.id
GROUP BY u.id, u.username
ORDER BY win_rate DESC;
```

**Expected Data:**
- 10 player records per match (5v5)
- Realistic K/D/A values
- MVP awards scattered across players
- Win/loss distribution

---

### 12. FORUM_CATEGORIES TABLE

**Purpose:** Define forum categories

**Required Fields:**
- id (UUID)
- title (not null)
- description (not null)
- order (display order)

**Verification Query:**
```sql
-- List forum categories
SELECT title, description FROM forum_categories ORDER BY "order";

-- Count posts per category (via threads)
SELECT fc.title, COUNT(ft.id) as thread_count
FROM forum_categories fc
LEFT JOIN forum_threads ft ON fc.id = ft.category_id
GROUP BY fc.id, fc.title;
```

**Expected Data:**
- At least 3-5 forum categories
- Examples: General, Support, Announcements, Trading, Feedback

---

### 13. FORUM_THREADS TABLE

**Purpose:** Forum discussion threads

**Required Fields:**
- id (UUID)
- category_id (references forum_categories)
- author_id (references users)
- title (not null)
- content (not null)
- is_pinned, is_locked (boolean)
- reply_count (number of replies)

**Verification Query:**
```sql
-- Count threads
SELECT COUNT(*) as total_threads FROM forum_threads;

-- Threads by category
SELECT fc.title, COUNT(ft.id) as thread_count
FROM forum_categories fc
JOIN forum_threads ft ON fc.id = ft.category_id
GROUP BY fc.id, fc.title;

-- Most active threads
SELECT title, reply_count, views 
FROM forum_threads 
ORDER BY reply_count DESC 
LIMIT 10;
```

**Expected Data:**
- At least 20-30 forum threads
- Mix of different categories
- Some threads should be pinned
- Realistic reply counts (0-50)

---

### 14. FORUM_POSTS TABLE

**Purpose:** Individual forum posts/replies

**Required Fields:**
- id (UUID)
- thread_id (references forum_threads)
- author_id (references users)
- content (not null)
- created_at (timestamp)

**Verification Query:**
```sql
-- Count total posts
SELECT COUNT(*) as total_posts FROM forum_posts;

-- Posts per thread
SELECT ft.title, COUNT(fp.id) as post_count
FROM forum_threads ft
LEFT JOIN forum_posts fp ON ft.id = fp.thread_id
GROUP BY ft.id, ft.title
ORDER BY post_count DESC;

-- Most active posters
SELECT u.username, COUNT(fp.id) as post_count
FROM forum_posts fp
JOIN users u ON fp.author_id = u.id
GROUP BY u.id, u.username
ORDER BY post_count DESC;
```

**Expected Data:**
- At least 100-200 forum posts
- Multiple posts per thread
- Posts spread across multiple users

---

### 15. AC_EVENTS TABLE

**Purpose:** Anti-cheat violation logging

**Required Fields:**
- id (UUID)
- user_id (references users)
- match_id (references matches, optional)
- code (violation code)
- severity (1-10 rating)
- details (JSON data)
- reviewed (boolean)

**Verification Query:**
```sql
-- Count AC events
SELECT COUNT(*) as total_events FROM ac_events;

-- Events by severity
SELECT severity, COUNT(*) as count FROM ac_events GROUP BY severity;

-- Most violated codes
SELECT code, COUNT(*) as count FROM ac_events GROUP BY code ORDER BY count DESC;

-- Reviewed vs unreviewed
SELECT reviewed, COUNT(*) as count FROM ac_events GROUP BY reviewed;
```

**Expected Data:**
- For live deployments: varies based on cheating activity
- For testing: 5-10 sample events with different codes/severity

---

### 16. TRANSACTIONS TABLE

**Purpose:** Track currency and item purchases

**Required Fields:**
- id (UUID)
- user_id (references users)
- type (purchase, refund, reward, etc)
- amount (decimal)
- created_at (timestamp)

**Verification Query:**
```sql
-- Count transactions
SELECT COUNT(*) as total_transactions FROM transactions;

-- Revenue by transaction type
SELECT type, COUNT(*) as count, SUM(CAST(amount as DECIMAL)) as total
FROM transactions
GROUP BY type;

-- Top spenders
SELECT u.username, SUM(CAST(t.amount as DECIMAL)) as total_spent
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.type = 'purchase'
GROUP BY u.id, u.username
ORDER BY total_spent DESC
LIMIT 10;
```

**Expected Data:**
- Transaction records for cosmetic purchases
- Refund records if applicable
- Reward/bonus transactions

---

### 17. NOTIFICATIONS TABLE

**Purpose:** User notification history

**Required Fields:**
- id (UUID)
- user_id (references users)
- type (string, e.g., "achievement_unlocked")
- title (not null)
- message (not null)
- read (boolean)

**Verification Query:**
```sql
-- Count notifications
SELECT COUNT(*) as total_notifications FROM notifications;

-- Unread notifications
SELECT COUNT(*) as unread FROM notifications WHERE read = false;

-- Notifications by type
SELECT type, COUNT(*) as count FROM notifications GROUP BY type;

-- Most recent notifications
SELECT u.username, title, created_at 
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Data:**
- At least 50-100 notifications
- Various notification types
- Mix of read and unread

---

### 18. SITE_CONFIG TABLE

**Purpose:** Admin configuration settings

**Required Fields:**
- id (UUID)
- key (string, unique)
- value (JSON)
- updated_at (timestamp)

**Verification Query:**
```sql
-- List all config settings
SELECT key FROM site_config;

-- Check specific config
SELECT key, value FROM site_config WHERE key = 'appearance';

-- Last update time
SELECT key, updated_at FROM site_config ORDER BY updated_at DESC;
```

**Expected Config Keys:**
- appearance (logo, colors, theme)
- features (feature flags)
- economy (currency rates, rewards)
- landing_page (hero section, content)
- social_media (links, integration)
- contact (email, support info)

---

## Data Integrity Checklist

### Essential Data Required:
- [ ] At least 1 admin user in users table
- [ ] At least 20 achievements defined
- [ ] At least 5 daily missions and 3 weekly missions
- [ ] At least 10 badges defined
- [ ] At least 20 cosmetics (mix of types)
- [ ] ESR thresholds for all 5 tiers (20 rows total)
- [ ] At least 3-5 forum categories
- [ ] Site configuration keys set

### Recommended Data:
- [ ] 50+ finished matches with player stats
- [ ] 20+ forum threads with 100+ total posts
- [ ] 100+ user achievement records (varied progress)
- [ ] 50+ user-owned cosmetics distributed across users
- [ ] 100+ transaction records
- [ ] 50+ notifications

### Optional but Helpful:
- [ ] Sample AC events (for anti-cheat testing)
- [ ] User bans (for ban system testing)
- [ ] Multiple user metrics entries

---

## Seed Data Script Location

A complete seed script should be available at:
```bash
/workspaces/eclip/scripts/seed-complete.js
```

To run seed data:
```bash
npm run seed  # or similar command
```

---

## Verification Command Checklist

Quick commands to verify all critical data:

```bash
# Total rows per table
psql -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'achievements' as table_name, COUNT(*) FROM achievements UNION ALL SELECT 'missions' as table_name, COUNT(*) FROM missions UNION ALL SELECT 'matches' as table_name, COUNT(*) FROM matches;"

# Check all admin users
psql -c "SELECT username, email FROM users WHERE role = 'ADMIN';"

# Verify ESR thresholds complete
psql -c "SELECT COUNT(*) FROM esr_thresholds; --should be 20 (5 tiers * 4 divisions)"

# Check cosmetics inventory
psql -c "SELECT type, COUNT(*) FROM cosmetics GROUP BY type;"

# Verify achievements have rewards
psql -c "SELECT COUNT(*) FROM achievements WHERE reward_xp > 0;"
```

---

## Conclusion

A fully seeded database should have:
- ✅ Multiple users with varied ranks/ESR
- ✅ Comprehensive achievement and mission systems
- ✅ Complete badge and cosmetic inventories
- ✅ Historical match data
- ✅ Active forum discussions
- ✅ Proper tier/division structure
- ✅ Configuration settings

Verify all items in this guide before considering the database production-ready.

