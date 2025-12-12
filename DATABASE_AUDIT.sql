-- 🔍 ECLIP DATABASE HEALTH CHECK SCRIPT
-- Run this directly in Neon dashboard to audit your database
-- Copy and paste the entire script or run section by section

-- ============================================================================
-- 1. QUICK HEALTH CHECK
-- ============================================================================
-- Run this first to get an overview

SELECT 'Users' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 'Admins', COUNT(*) FROM users WHERE role = 'ADMIN'
UNION ALL
SELECT 'Email Verified', COUNT(*) FROM users WHERE "email_verified" = true
UNION ALL
SELECT 'Active Sessions', COUNT(*) FROM sessions WHERE "expiresAt" >= NOW()
UNION ALL
SELECT 'Expired Sessions', COUNT(*) FROM sessions WHERE "expiresAt" < NOW()
UNION ALL
SELECT 'Matches', COUNT(*) FROM matches
UNION ALL
SELECT 'Forum Threads', COUNT(*) FROM "forumThreads"
UNION ALL
SELECT 'Forum Categories', COUNT(*) FROM "forumCategories"
UNION ALL
SELECT 'Cosmetics', COUNT(*) FROM cosmetics
UNION ALL
SELECT 'User Profiles', COUNT(*) FROM "user_profiles";

-- ============================================================================
-- 2. CHECK FOR ADMIN USERS
-- ============================================================================

SELECT username, email, role, "email_verified", "created_at" 
FROM users 
WHERE role = 'ADMIN' 
ORDER BY "created_at" DESC;

-- ============================================================================
-- 3. CHECK FOR DATA QUALITY ISSUES
-- ============================================================================

-- Users with no email
SELECT COUNT(*) as users_no_email FROM users WHERE email IS NULL OR email = '';

-- Users with no username
SELECT COUNT(*) as users_no_username FROM users WHERE username IS NULL OR username = '';

-- Users with invalid roles
SELECT role, COUNT(*) as count FROM users 
WHERE role NOT IN ('USER', 'VIP', 'INSIDER', 'MODERATOR', 'ADMIN')
GROUP BY role;

-- Users with placeholder Steam IDs
SELECT COUNT(*) as users_with_temp_steam FROM users 
WHERE "steam_id" LIKE 'temp-%' OR "steam_id" = '';

-- ============================================================================
-- 4. CHECK SESSION HEALTH
-- ============================================================================

-- Expired sessions
SELECT COUNT(*) as expired_sessions FROM sessions WHERE "expires_at" < NOW();

-- Active sessions
SELECT COUNT(*) as active_sessions FROM sessions WHERE "expires_at" >= NOW();

-- Sessions for non-existent users (orphaned)
SELECT COUNT(*) as orphaned_sessions FROM sessions s
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = s."userId");

-- ============================================================================
-- 5. CHECK USER PROFILES
-- ============================================================================

-- Users without profiles
SELECT COUNT(*) as users_without_profile FROM users u
WHERE NOT EXISTS (SELECT 1 FROM "user_profiles" p WHERE p."userId" = u.id);

-- List users without profiles
SELECT id, username, email FROM users u
WHERE NOT EXISTS (SELECT 1 FROM "user_profiles" p WHERE p."userId" = u.id)
LIMIT 10;

-- ============================================================================
-- 6. CHECK MATCH DATA INTEGRITY
-- ============================================================================

-- Match status distribution
SELECT status, COUNT(*) as count FROM matches GROUP BY status ORDER BY count DESC;

-- Players in non-existent matches (orphaned)
SELECT COUNT(*) as orphaned_match_players FROM "matchPlayers" mp
WHERE NOT EXISTS (SELECT 1 FROM matches m WHERE m.id = mp."matchId");

-- Matches with no players
SELECT id FROM matches m
WHERE NOT EXISTS (SELECT 1 FROM "matchPlayers" mp WHERE mp."matchId" = m.id)
LIMIT 5;

-- ============================================================================
-- 7. CHECK FORUM SYSTEM
-- ============================================================================

-- Forum categories
SELECT id, title, COUNT(t.id) as thread_count
FROM "forumCategories" fc
LEFT JOIN "forumThreads" t ON t."categoryId" = fc.id
GROUP BY fc.id, fc.title
ORDER BY thread_count DESC;

-- Threads without categories (orphaned)
SELECT COUNT(*) as threads_without_category FROM "forumThreads"
WHERE "categoryId" IS NULL;

-- Threads without authors
SELECT COUNT(*) as threads_without_author FROM "forumThreads"
WHERE "authorId" IS NULL;

-- ============================================================================
-- 8. CHECK COSMETICS SHOP
-- ============================================================================

-- Cosmetics by type and rarity
SELECT type, rarity, COUNT(*) as count FROM cosmetics
WHERE "isActive" = true
GROUP BY type, rarity
ORDER BY type, rarity;

-- User cosmetics inventory
SELECT "userId", COUNT(*) as items_owned FROM "user_inventory"
GROUP BY "userId"
ORDER BY items_owned DESC
LIMIT 10;

-- ============================================================================
-- 9. ROLE DISTRIBUTION
-- ============================================================================

SELECT role, COUNT(*) as count FROM users 
GROUP BY role 
ORDER BY count DESC;

-- ============================================================================
-- 10. USER STATISTICS
-- ============================================================================

-- User creation timeline
SELECT DATE(created_at) as date, COUNT(*) as signups 
FROM users 
GROUP BY DATE(created_at) 
ORDER BY date DESC 
LIMIT 30;

-- Average ESR
SELECT ROUND(AVG(esr)) as avg_esr, MIN(esr) as min_esr, MAX(esr) as max_esr FROM users;

-- Total coins in circulation
SELECT ROUND(SUM(coins::numeric)::numeric, 2) as total_coins FROM users;

-- Average level
SELECT ROUND(AVG(level)) as avg_level FROM users;

-- ============================================================================
-- 11. RECOMMENDATIONS SUMMARY
-- ============================================================================

SELECT 
  CASE WHEN (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') > 0 THEN '✅' ELSE '❌' END || ' Admin users exist' as rec_1,
  CASE WHEN (SELECT COUNT(*) FROM users WHERE email IS NULL) = 0 THEN '✅' ELSE '❌' END || ' All users have emails' as rec_2,
  CASE WHEN (SELECT COUNT(*) FROM sessions WHERE "expiresAt" < NOW()) < (SELECT COUNT(*) FROM sessions) * 0.1 THEN '✅' ELSE '⚠️' END || ' Expired sessions < 10%' as rec_3,
  CASE WHEN (SELECT COUNT(*) FROM "forumCategories") > 0 THEN '✅' ELSE '❌' END || ' Forum categories exist' as rec_4,
  CASE WHEN (SELECT COUNT(*) FROM cosmetics WHERE "isActive" = true) > 0 THEN '✅' ELSE '❌' END || ' Cosmetics available' as rec_5;

-- ============================================================================
-- MAINTENANCE QUERIES
-- ============================================================================

-- These should be run periodically

-- Clean up expired sessions (run weekly)
-- DELETE FROM sessions WHERE "expiresAt" < NOW() - INTERVAL '1 day';

-- Clean up orphaned match players (run weekly)
-- DELETE FROM "matchPlayers" WHERE "matchId" NOT IN (SELECT id FROM matches);

-- Clean up orphaned forum threads (run weekly)
-- DELETE FROM "forumThreads" WHERE "categoryId" NOT NULL AND "categoryId" NOT IN (SELECT id FROM "forumCategories");

-- Create missing user profiles (run once if needed)
-- INSERT INTO "user_profiles" ("id", "userId", "createdAt", "updatedAt")
-- SELECT gen_random_uuid(), id, NOW(), NOW() FROM users u
-- WHERE NOT EXISTS (SELECT 1 FROM "user_profiles" p WHERE p."userId" = u.id);

-- ============================================================================
-- END OF AUDIT SCRIPT
-- ============================================================================
