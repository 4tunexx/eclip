-- Eclip.pro Initial Data Seeding Script
-- Run this after creating your admin user

-- ============================================
-- 1. FORUM CATEGORIES
-- ============================================

INSERT INTO forum_categories (id, name, description, order_index, created_at)
VALUES
  (gen_random_uuid(), 'Announcements', 'Platform updates, news, and important announcements', 1, NOW()),
  (gen_random_uuid(), 'General Discussion', 'Talk about anything related to CS2 and Eclip.pro', 2, NOW()),
  (gen_random_uuid(), 'Feedback', 'Share your feedback and suggestions to help us improve', 3, NOW()),
  (gen_random_uuid(), 'Bug Reports', 'Found a bug? Report it here so we can fix it', 4, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. COSMETICS (Sample Items)
-- ============================================

INSERT INTO cosmetics (id, name, type, rarity, price, image_url, is_active, created_at)
VALUES
  (gen_random_uuid(), 'Starter Avatar', 'AVATAR', 'Common', 50, 'https://via.placeholder.com/150?text=Avatar', true, NOW()),
  (gen_random_uuid(), 'Pro Badge', 'BADGE', 'Rare', 200, 'https://via.placeholder.com/150?text=Badge', true, NOW()),
  (gen_random_uuid(), 'Epic Border', 'BORDER', 'Epic', 500, 'https://via.placeholder.com/150?text=Border', true, NOW()),
  (gen_random_uuid(), 'Legendary Profile Frame', 'FRAME', 'Legendary', 1000, 'https://via.placeholder.com/150?text=Frame', true, NOW()),
  (gen_random_uuid(), 'Silver Avatar', 'AVATAR', 'Common', 75, 'https://via.placeholder.com/150?text=Silver', true, NOW()),
  (gen_random_uuid(), 'Gold Badge', 'BADGE', 'Epic', 750, 'https://via.placeholder.com/150?text=Gold', true, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. MISSIONS
-- ============================================

-- Daily Missions
INSERT INTO missions (id, title, description, type, target_value, reward_xp, reward_coins, is_active, created_at)
VALUES
  (gen_random_uuid(), 'Win 3 Matches', 'Win 3 competitive matches today', 'WINS', 3, 500, 50, true, NOW()),
  (gen_random_uuid(), 'Get 30 Kills', 'Get 30 kills across all matches today', 'KILLS', 30, 300, 30, true, NOW()),
  (gen_random_uuid(), 'Play 5 Matches', 'Complete 5 matches today', 'MATCHES_PLAYED', 5, 200, 20, true, NOW())
ON CONFLICT DO NOTHING;

-- Weekly Missions
INSERT INTO missions (id, title, description, type, target_value, reward_xp, reward_coins, is_active, created_at)
VALUES
  (gen_random_uuid(), 'Win 15 Matches', 'Win 15 competitive matches this week', 'WINS', 15, 2000, 200, true, NOW()),
  (gen_random_uuid(), 'Get 150 Kills', 'Get 150 kills this week', 'KILLS', 150, 1500, 150, true, NOW()),
  (gen_random_uuid(), 'Play 20 Matches', 'Complete 20 matches this week', 'MATCHES_PLAYED', 20, 1000, 100, true, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (id, title, description, icon_url, reward_xp, reward_coins, is_active, created_at)
VALUES
  (gen_random_uuid(), 'First Blood', 'Win your first match', 'https://via.placeholder.com/64?text=First', 100, 10, true, NOW()),
  (gen_random_uuid(), 'Killing Spree', 'Get 10 kills in a single match', 'https://via.placeholder.com/64?text=Kill', 200, 20, true, NOW()),
  (gen_random_uuid(), 'Unstoppable', 'Win 10 matches in a row', 'https://via.placeholder.com/64?text=Win', 500, 50, true, NOW()),
  (gen_random_uuid(), 'Master', 'Reach Master rank', 'https://via.placeholder.com/64?text=Master', 1000, 100, true, NOW()),
  (gen_random_uuid(), 'Veteran', 'Play 100 matches', 'https://via.placeholder.com/64?text=100', 300, 30, true, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES
-- ============================================

-- After running this script:
-- 1. Verify data was inserted: SELECT COUNT(*) FROM forum_categories;
-- 2. Check cosmetics: SELECT * FROM cosmetics;
-- 3. Check missions: SELECT * FROM missions;
-- 4. Update image URLs with actual images later
-- 5. Adjust prices/rewards as needed

