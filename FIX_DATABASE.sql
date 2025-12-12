-- ========================================
-- FIX NEON DATABASE ISSUES
-- ========================================
-- Run these SQL commands in your Neon Console to fix login/register issues

-- 1️⃣  FIX INVALID "BRONZE" RANKS (Bronze doesn't exist in rank system!)
UPDATE users
SET rank = CASE 
  WHEN esr IS NULL OR esr < 500 THEN 'Beginner'
  WHEN esr >= 500 AND esr < 1000 THEN 'Rookie'
  WHEN esr >= 1000 AND esr < 2000 THEN 'Pro'
  WHEN esr >= 2000 AND esr < 3500 THEN 'Ace'
  ELSE 'Legend'
END,
rank_tier = CASE 
  WHEN esr IS NULL OR esr < 500 THEN 'Beginner'
  WHEN esr >= 500 AND esr < 1000 THEN 'Rookie'
  WHEN esr >= 1000 AND esr < 2000 THEN 'Pro'
  WHEN esr >= 2000 AND esr < 3500 THEN 'Ace'
  ELSE 'Legend'
END
WHERE rank = 'Bronze' OR rank_tier = 'Bronze';

-- 2️⃣  FIX MISSING rank_division (should be 1, 2, or 3)
UPDATE users
SET rank_division = CASE 
  WHEN esr IS NULL OR esr < 166.67 THEN 1
  WHEN esr >= 166.67 AND esr < 333.34 THEN 2
  WHEN esr >= 333.34 AND esr < 500 THEN 3
  WHEN esr >= 500 AND esr < 666.67 THEN 1
  WHEN esr >= 666.67 AND esr < 833.34 THEN 2
  WHEN esr >= 833.34 AND esr < 1000 THEN 3
  WHEN esr >= 1000 AND esr < 1333.34 THEN 1
  WHEN esr >= 1333.34 AND esr < 1666.67 THEN 2
  ELSE 3
END
WHERE rank_division IS NULL OR rank_division = 0;

-- 3️⃣  VERIFY FIXES
SELECT 
  username, 
  email, 
  rank, 
  rank_tier, 
  rank_division, 
  esr,
  role,
  email_verified
FROM users 
ORDER BY created_at DESC;

-- 4️⃣  (OPTIONAL) MAKE YOUR USER ADMIN SO YOU CAN ACCESS ADMIN PANEL
-- Replace 'your_email@example.com' with your actual email
UPDATE users SET role = 'ADMIN' WHERE email = 'pawav14370@lawior.com';

-- 5️⃣  (OPTIONAL) VERIFY ADMIN WAS SET
SELECT id, username, email, role FROM users WHERE role = 'ADMIN';
