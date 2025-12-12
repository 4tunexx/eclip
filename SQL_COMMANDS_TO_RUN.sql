-- QUICK SQL COMMANDS TO RUN IN NEON CONSOLE
-- https://console.neon.tech -> neondb -> SQL Editor

-- ============================================================================
-- 1. CHECK CURRENT STATE
-- ============================================================================

SELECT 
  'users' as table_name, COUNT(*) as rows FROM users
UNION ALL SELECT 'matches', COUNT(*) FROM matches
UNION ALL SELECT 'match_players', COUNT(*) FROM match_players
UNION ALL SELECT 'forum_threads', COUNT(*) FROM forum_threads
UNION ALL SELECT 'forum_posts', COUNT(*) FROM forum_posts
UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL SELECT 'missions', COUNT(*) FROM missions
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions;

-- Expected BEFORE population:
-- users: 17, matches: 1, match_players: 0-50, forum_threads: 0, etc.

-- ============================================================================
-- 2. RUN THIS TO POPULATE WITH MATCHES & PLAYER STATS
-- ============================================================================

-- Create 5 matches with 50 player records
WITH new_matches AS (
  INSERT INTO matches (id, ladder, map, status, "started_at", "ended_at", "winner_team")
  VALUES 
    (gen_random_uuid(), 'ranked', 'Inferno', 'FINISHED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '45 minutes', '1'),
    (gen_random_uuid(), 'ranked', 'Mirage', 'FINISHED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '50 minutes', '2'),
    (gen_random_uuid(), 'ranked', 'Cache', 'FINISHED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '42 minutes', '1'),
    (gen_random_uuid(), 'ranked', 'Dust2', 'FINISHED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '48 minutes', '2'),
    (gen_random_uuid(), 'ranked', 'Nuke', 'FINISHED', NOW(), NOW() + INTERVAL '45 minutes', '1')
  RETURNING id, map, winner_team
)
INSERT INTO match_players (id, match_id, "user_id", team, kills, deaths, assists, hs_percentage, mvps, is_winner, "created_at")
SELECT 
  gen_random_uuid(),
  nm.id,
  u.id,
  CASE WHEN ROW_NUMBER() OVER (PARTITION BY nm.id ORDER BY u.id) <= 5 THEN 1 ELSE 2 END as team,
  (RANDOM() * 25 + 10)::INT,
  (RANDOM() * 18 + 3)::INT,
  (RANDOM() * 12 + 2)::INT,
  (RANDOM() * 75)::INT,
  (RANDOM() * 4)::INT,
  CASE WHEN ROW_NUMBER() OVER (PARTITION BY nm.id ORDER BY u.id) <= 5 THEN nm.winner_team = '1' ELSE nm.winner_team = '2' END,
  NOW()
FROM new_matches nm
CROSS JOIN (SELECT id FROM users LIMIT 10) u;

-- ============================================================================
-- 3. RUN THIS TO SEE REAL USER STATISTICS FROM MATCHES
-- ============================================================================

SELECT 
  u.username,
  u.esr,
  COUNT(DISTINCT mp.match_id) as matches_played,
  COALESCE(SUM(mp.kills), 0) as total_kills,
  COALESCE(SUM(mp.deaths), 0) as total_deaths,
  COALESCE(SUM(CASE WHEN mp.is_winner THEN 1 ELSE 0 END), 0) as matches_won,
  CASE WHEN SUM(mp.deaths) > 0 THEN (SUM(mp.kills)::NUMERIC / SUM(mp.deaths))::NUMERIC(5,2) ELSE SUM(mp.kills)::NUMERIC(5,2) END as kd_ratio,
  COALESCE(AVG(mp.hs_percentage), 0)::INT as avg_hs_percent
FROM users u
LEFT JOIN match_players mp ON u.id = mp.user_id
GROUP BY u.id, u.username, u.esr
ORDER BY matches_played DESC, total_kills DESC;

-- ============================================================================
-- 4. RUN THIS TO CREATE FORUM CONTENT
-- ============================================================================

-- Create forum threads
INSERT INTO forum_threads (id, category_id, author_id, title, content, "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  fc.id,
  u.id,
  'Discussion: Best strategies for ' || fc.title,
  'In this thread we discuss competitive strategies and tips for improvement.',
  NOW() - INTERVAL '7 days',
  NOW()
FROM forum_categories fc
CROSS JOIN (SELECT id FROM users LIMIT 1) u;

-- Create forum posts (replies)
INSERT INTO forum_posts (id, thread_id, author_id, content, "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  ft.id,
  (SELECT id FROM users ORDER BY RANDOM() LIMIT 1),
  'Great point! I completely agree with this and have seen good results using this strategy.',
  NOW() - INTERVAL '3 days',
  NOW()
FROM forum_threads ft
LIMIT 5;

-- ============================================================================
-- 5. RUN THIS TO CREATE MISSIONS
-- ============================================================================

INSERT INTO missions (id, title, description, category, requirement_type, target, reward_xp, is_active, "created_at", "updated_at")
VALUES 
  (gen_random_uuid(), 'Daily Matches', 'Play 3 matches today', 'DAILY', 'STAT_BASED', 3, 100, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'Kill Master', 'Get 100 total kills', 'INGAME', 'STAT_BASED', 100, 250, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'Team Player', 'Get 100 assists', 'INGAME', 'STAT_BASED', 100, 150, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'Weekly Grind', 'Play 10 matches this week', 'DAILY', 'STAT_BASED', 10, 500, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. RUN THIS TO VERIFY ALL DATA AFTER POPULATION
-- ============================================================================

SELECT 
  'users' as table_name, COUNT(*) as rows FROM users
UNION ALL SELECT 'matches', COUNT(*) FROM matches
UNION ALL SELECT 'match_players', COUNT(*) FROM match_players
UNION ALL SELECT 'match_stats', COUNT(*) FROM match_stats
UNION ALL SELECT 'forum_categories', COUNT(*) FROM forum_categories
UNION ALL SELECT 'forum_threads', COUNT(*) FROM forum_threads
UNION ALL SELECT 'forum_posts', COUNT(*) FROM forum_posts
UNION ALL SELECT 'missions', COUNT(*) FROM missions
UNION ALL SELECT 'user_mission_progress', COUNT(*) FROM user_mission_progress
UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL SELECT 'user_achievements', COUNT(*) FROM user_achievements
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
ORDER BY table_name;

-- Expected AFTER population:
-- matches: 5, match_players: 50, forum_threads: 3+, missions: 4+

-- ============================================================================
-- 7. RUN THIS TO SEE TOP PLAYERS BY K/D RATIO (REAL DATA!)
-- ============================================================================

SELECT 
  u.username,
  u.esr,
  u.level,
  COUNT(DISTINCT mp.match_id) as matches,
  SUM(mp.kills)::INT as kills,
  SUM(mp.deaths)::INT as deaths,
  ROUND((SUM(mp.kills)::NUMERIC / NULLIF(SUM(mp.deaths), 0)), 2) as kd_ratio,
  SUM(CASE WHEN mp.is_winner THEN 1 ELSE 0 END)::INT as wins
FROM users u
LEFT JOIN match_players mp ON u.id = mp.user_id
GROUP BY u.id, u.username, u.esr, u.level
HAVING COUNT(DISTINCT mp.match_id) > 0
ORDER BY kd_ratio DESC, kills DESC;

-- ============================================================================
-- 8. RUN THIS TO CHECK FORUM ACTIVITY
-- ============================================================================

SELECT 
  fc.title as category,
  COUNT(DISTINCT ft.id) as threads,
  COUNT(DISTINCT fp.id) as posts
FROM forum_categories fc
LEFT JOIN forum_threads ft ON fc.id = ft.category_id
LEFT JOIN forum_posts fp ON ft.id = fp.thread_id
GROUP BY fc.id, fc.title;

-- ============================================================================
-- 9. RUN THIS TO SEE MISSION PROGRESS
-- ============================================================================

SELECT 
  m.title,
  COUNT(DISTINCT ump.user_id) as users_with_progress,
  SUM(CASE WHEN ump.completed THEN 1 ELSE 0 END) as completed
FROM missions m
LEFT JOIN user_mission_progress ump ON m.id = ump.mission_id
GROUP BY m.id, m.title;

-- ============================================================================
-- SUMMARY: Expected Results After Running All Commands
-- ============================================================================
-- users: 17 (unchanged)
-- matches: 6 (1 original + 5 new)
-- match_players: 50+ (all new)
-- forum_threads: 3+ (new content)
-- missions: 4+ (new missions)
-- 
-- Real statistics will show:
-- - K/D ratios calculated from actual match records
-- - Win rates based on match outcomes
-- - Total kills/deaths from all matches
-- - Forum activity with real posts
-- - Mission progress for users
