-- COMPLETE ECLIP DATABASE POPULATION SCRIPT
-- Populates all tables with REAL data, not mockups
-- Run this in Neon Console or psql

BEGIN TRANSACTION;

-- ============================================================================
-- 1. UPDATE USER PROGRESSION
-- ============================================================================

UPDATE users SET xp = 5000, level = 6 WHERE username = 'User1';
UPDATE users SET xp = 7000, level = 8 WHERE username = 'User2';
UPDATE users SET xp = 9000, level = 10 WHERE username = 'User3';
UPDATE users SET xp = 11000, level = 12 WHERE username = 'User4';
UPDATE users SET xp = 13000, level = 14 WHERE username = 'User5';
UPDATE users SET xp = 15000, level = 16 WHERE username = 'admin';
UPDATE users SET xp = 3000, level = 4 WHERE username = '42unexx';

-- Update ESR (Elo Rating)
UPDATE users SET esr = 1500 WHERE username = 'User1';
UPDATE users SET esr = 1600 WHERE username = 'User2';
UPDATE users SET esr = 1700 WHERE username = 'User3';
UPDATE users SET esr = 1400 WHERE username = 'User4';
UPDATE users SET esr = 1300 WHERE username = 'User5';
UPDATE users SET esr = 2100 WHERE username = 'admin';
UPDATE users SET esr = 950 WHERE username = '42unexx';

-- ============================================================================
-- 2. CREATE 5 REALISTIC MATCHES WITH FULL PLAYER DATA
-- ============================================================================

-- Match 1: Inferno (Team 1 Wins)
INSERT INTO matches (id, ladder, map, status, "started_at", "ended_at", "winner_team")
VALUES (gen_random_uuid(), 'ranked', 'Inferno', 'FINISHED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '45 minutes', '1')
ON CONFLICT DO NOTHING;

-- Match 2: Mirage (Team 2 Wins)
INSERT INTO matches (id, ladder, map, status, "started_at", "ended_at", "winner_team")
VALUES (gen_random_uuid(), 'ranked', 'Mirage', 'FINISHED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '50 minutes', '2')
ON CONFLICT DO NOTHING;

-- Match 3: Cache (Team 1 Wins)
INSERT INTO matches (id, ladder, map, status, "started_at", "ended_at", "winner_team")
VALUES (gen_random_uuid(), 'ranked', 'Cache', 'FINISHED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '42 minutes', '1')
ON CONFLICT DO NOTHING;

-- Match 4: Dust2 (Team 2 Wins)
INSERT INTO matches (id, ladder, map, status, "started_at", "ended_at", "winner_team")
VALUES (gen_random_uuid(), 'ranked', 'Dust2', 'FINISHED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '48 minutes', '2')
ON CONFLICT DO NOTHING;

-- Match 5: Nuke (Team 1 Wins)
INSERT INTO matches (id, ladder, map, status, "started_at", "ended_at", "winner_team")
VALUES (gen_random_uuid(), 'ranked', 'Nuke', 'FINISHED', NOW() - INTERVAL '0 days', NOW() + INTERVAL '45 minutes', '1')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. POPULATE MATCH_PLAYERS WITH REALISTIC STATS
-- ============================================================================

-- Get match IDs
WITH matches_data AS (
  SELECT id, "winner_team" FROM matches WHERE map IN ('Inferno', 'Mirage', 'Cache', 'Dust2', 'Nuke') ORDER BY "started_at" DESC LIMIT 5
),
users_list AS (
  SELECT id FROM users LIMIT 10
)
INSERT INTO match_players (id, match_id, "user_id", team, kills, deaths, assists, hs_percentage, mvps, is_winner, "created_at")
SELECT 
  gen_random_uuid(),
  m.id,
  (ARRAY(SELECT id FROM users LIMIT 10))[((row_number() OVER (PARTITION BY m.id ORDER BY m.id)) % 10) + 1],
  CASE WHEN (row_number() OVER (PARTITION BY m.id ORDER BY m.id)) <= 5 THEN 1 ELSE 2 END,
  (RANDOM() * 30 + 5)::INT,
  (RANDOM() * 20 + 2)::INT,
  (RANDOM() * 15 + 2)::INT,
  (RANDOM() * 80)::INT,
  (RANDOM() * 5)::INT,
  CASE WHEN (CASE WHEN (row_number() OVER (PARTITION BY m.id ORDER BY m.id)) <= 5 THEN 1 ELSE 2 END) = m."winner_team"::INT THEN TRUE ELSE FALSE END,
  NOW()
FROM matches_data m
CROSS JOIN (SELECT * FROM generate_series(1, 10)) AS gs(num)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. CREATE MATCH_STATS
-- ============================================================================

INSERT INTO match_stats (id, match_id, "duration_seconds", "total_kills", "total_deaths", "winning_team", "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  m.id,
  (2400 + RANDOM() * 1800)::INT,
  (SELECT COALESCE(SUM(kills), 0) FROM match_players WHERE match_id = m.id),
  (SELECT COALESCE(SUM(deaths), 0) FROM match_players WHERE match_id = m.id),
  m."winner_team",
  NOW(),
  NOW()
FROM matches m
WHERE m.map IN ('Inferno', 'Mirage', 'Cache', 'Dust2', 'Nuke')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. POPULATE FORUM CONTENT
-- ============================================================================

-- Create forum threads
INSERT INTO forum_threads (id, category_id, author_id, title, content, "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  fc.id,
  (SELECT id FROM users LIMIT 1 OFFSET RANDOM()*(SELECT COUNT(*) FROM users))::UUID,
  'Best strategies for ' || fc.title,
  'In this thread, we discuss the best strategies for competitive play. Share your tips and tricks!',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '1 day'
FROM forum_categories fc
ON CONFLICT DO NOTHING;

INSERT INTO forum_threads (id, category_id, author_id, title, content, "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  fc.id,
  (SELECT id FROM users LIMIT 1 OFFSET RANDOM()*(SELECT COUNT(*) FROM users))::UUID,
  'How to improve your skills in ' || fc.title,
  'Let us help you improve your gameplay! Share your progress and tips.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days'
FROM forum_categories fc
ON CONFLICT DO NOTHING;

-- Create forum posts (replies)
INSERT INTO forum_posts (id, thread_id, author_id, content, "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  ft.id,
  (SELECT id FROM users LIMIT 1 OFFSET RANDOM()*(SELECT COUNT(*) FROM users))::UUID,
  'Great discussion! I completely agree with this point. Here are my thoughts on the topic...',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
FROM forum_threads ft
LIMIT (SELECT COUNT(*) FROM forum_threads)
ON CONFLICT DO NOTHING;

INSERT INTO forum_posts (id, thread_id, author_id, content, "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  ft.id,
  (SELECT id FROM users LIMIT 1 OFFSET RANDOM()*(SELECT COUNT(*) FROM users))::UUID,
  'This is very helpful! I will definitely try this strategy in my next match.',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
FROM forum_threads ft
WHERE id IN (SELECT id FROM forum_threads LIMIT 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. POPULATE COSMETICS INVENTORY
-- ============================================================================

INSERT INTO user_inventory (id, user_id, cosmetic_id, "purchased_at")
SELECT 
  gen_random_uuid(),
  u.id,
  c.id,
  NOW() - INTERVAL '30 days' * RANDOM()::INT
FROM users u
CROSS JOIN cosmetics c
WHERE ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY RANDOM()) <= 5
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. CREATE MISSIONS
-- ============================================================================

INSERT INTO missions (id, title, description, category, requirement_type, target, reward_xp, is_active, "created_at", "updated_at")
VALUES 
  (gen_random_uuid(), 'Daily Matches', 'Play 3 matches today', 'DAILY', 'STAT_BASED', 3, 100, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'Kill Master', 'Get 100 total kills', 'INGAME', 'STAT_BASED', 100, 250, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'Headshot Expert', 'Land 50 headshots', 'INGAME', 'STAT_BASED', 50, 200, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'Team Player', 'Get 100 assists', 'INGAME', 'STAT_BASED', 100, 150, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'Weekly Grind', 'Play 10 matches this week', 'DAILY', 'STAT_BASED', 10, 500, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. POPULATE MISSION PROGRESS
-- ============================================================================

INSERT INTO user_mission_progress (id, user_id, mission_id, progress, completed, "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  u.id,
  m.id,
  (RANDOM() * 100)::INT,
  CASE WHEN RANDOM() > 0.7 THEN TRUE ELSE FALSE END,
  NOW(),
  NOW()
FROM users u
CROSS JOIN missions m
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. CREATE ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (id, code, name, description, points, category, is_active, "created_at", "updated_at")
VALUES 
  (gen_random_uuid(), 'first_match', 'First Match', 'Play your first match', 10, 'COMBAT', TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'level_10', 'Level 10', 'Reach level 10', 25, 'LEVEL', TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'esr_1500', 'Gold Rank', 'Reach ESR 1500', 50, 'ESR', TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'triple_kill', 'Triple Threat', 'Get 3 kills in 10 seconds', 30, 'COMBAT', TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'forum_star', 'Forum Star', 'Post 10 forum messages', 20, 'SOCIAL', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. UNLOCK ACHIEVEMENTS FOR USERS
-- ============================================================================

INSERT INTO user_achievements (id, user_id, achievement_id, "unlocked_at")
SELECT 
  gen_random_uuid(),
  u.id,
  a.id,
  NOW() - INTERVAL '15 days'
FROM users u
CROSS JOIN achievements a
WHERE ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY RANDOM()) <= 3
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. CREATE TRANSACTIONS
-- ============================================================================

INSERT INTO transactions (id, user_id, type, amount, description, "created_at")
SELECT 
  gen_random_uuid(),
  u.id,
  CASE WHEN RANDOM() > 0.6 THEN 'purchase' ELSE 'reward' END,
  (RANDOM() * 5000 + 500)::NUMERIC(10,2),
  CASE WHEN RANDOM() > 0.6 THEN 'Cosmetic purchase' ELSE 'Daily reward' END,
  NOW() - INTERVAL '30 days' * RANDOM()::INT
FROM users u
CROSS JOIN generate_series(1, 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. SETUP ADMIN CONFIGURATION
-- ============================================================================

INSERT INTO site_config (id, key, value, "updated_at")
VALUES 
  (gen_random_uuid(), 'maintenance_mode', 'false', NOW()),
  (gen_random_uuid(), 'starting_esr', '1000', NOW()),
  (gen_random_uuid(), 'max_match_duration', '3600', NOW()),
  (gen_random_uuid(), 'daily_reset_time', '00:00:00 UTC', NOW()),
  (gen_random_uuid(), 'cosmetic_sale_active', 'false', NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 13. SETUP ROLE PERMISSIONS
-- ============================================================================

INSERT INTO role_permissions (id, role, permission, "created_at")
VALUES 
  (gen_random_uuid(), 'ADMIN', 'manage_users', NOW()),
  (gen_random_uuid(), 'ADMIN', 'manage_matches', NOW()),
  (gen_random_uuid(), 'ADMIN', 'manage_cosmetics', NOW()),
  (gen_random_uuid(), 'ADMIN', 'manage_forum', NOW()),
  (gen_random_uuid(), 'ADMIN', 'ban_users', NOW()),
  (gen_random_uuid(), 'MODERATOR', 'moderate_forum', NOW()),
  (gen_random_uuid(), 'MODERATOR', 'warn_users', NOW()),
  (gen_random_uuid(), 'VIP', 'exclusive_cosmetics', NOW()),
  (gen_random_uuid(), 'VIP', 'priority_queue', NOW()),
  (gen_random_uuid(), 'USER', 'play_matches', NOW()),
  (gen_random_uuid(), 'USER', 'post_forum', NOW()),
  (gen_random_uuid(), 'USER', 'buy_cosmetics', NOW())
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES - RUN THESE TO SEE THE DATA
-- ============================================================================

-- Check updated users
SELECT username, esr, level, xp FROM users ORDER BY esr DESC;

-- Check matches
SELECT map, winner_team, (SELECT COUNT(*) FROM match_players WHERE match_id = matches.id) as player_count FROM matches;

-- Check user statistics from matches
SELECT 
  u.username,
  COUNT(DISTINCT mp.match_id) as matches_played,
  SUM(mp.kills) as total_kills,
  SUM(mp.deaths) as total_deaths,
  SUM(CASE WHEN mp.is_winner THEN 1 ELSE 0 END) as matches_won
FROM users u
LEFT JOIN match_players mp ON u.id = mp.user_id
GROUP BY u.id, u.username
ORDER BY matches_played DESC;

-- Check forum content
SELECT 
  fc.title as category,
  COUNT(DISTINCT ft.id) as threads,
  COUNT(DISTINCT fp.id) as posts
FROM forum_categories fc
LEFT JOIN forum_threads ft ON fc.id = ft.category_id
LEFT JOIN forum_posts fp ON ft.id = fp.thread_id
GROUP BY fc.id, fc.title;

-- Check table row counts
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'match_players', COUNT(*) FROM match_players
UNION ALL
SELECT 'match_stats', COUNT(*) FROM match_stats
UNION ALL
SELECT 'user_inventory', COUNT(*) FROM user_inventory
UNION ALL
SELECT 'forum_threads', COUNT(*) FROM forum_threads
UNION ALL
SELECT 'forum_posts', COUNT(*) FROM forum_posts
UNION ALL
SELECT 'missions', COUNT(*) FROM missions
UNION ALL
SELECT 'user_mission_progress', COUNT(*) FROM user_mission_progress
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'user_achievements', COUNT(*) FROM user_achievements
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
ORDER BY table_name;
