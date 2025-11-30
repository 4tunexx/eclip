-- Create Admin User Script
-- 
-- STEP 1: Generate password hash first
-- Run: node scripts/hash-password.js your_password
-- Copy the hash output
--
-- STEP 2: Replace <PASSWORD_HASH> below with the hash from step 1
-- STEP 3: Update email and username as needed
-- STEP 4: Run this SQL script

INSERT INTO users (
  id,
  email, 
  username, 
  password_hash, 
  role, 
  email_verified, 
  level, 
  xp, 
  mmr, 
  rank, 
  coins,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'admin@eclip.pro',                    -- Change this email
  'admin',                              -- Change this username
  '<PASSWORD_HASH>',                    -- Replace with hash from hash-password.js
  'ADMIN',
  true,
  1,
  0,
  1000,
  'Bronze',
  '0',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  role = 'ADMIN',
  email_verified = true,
  updated_at = NOW();

-- Verify the admin was created
SELECT id, email, username, role, email_verified 
FROM users 
WHERE role = 'ADMIN';

