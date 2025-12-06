-- Setup admin user in Neon PostgreSQL
-- Replace the password hash below with the bcrypt hash of 'Admin123!' (10 rounds)
-- OR use the Node script: node scripts/setup-admin.js

-- First, generate the hash with bcrypt
-- Online: https://bcrypt-generator.com/ (bcrypt cost: 10)
-- Or run: npx bcryptjs hash "Admin123!" 10

-- Then run this SQL:
-- OPTION 1: If admin@eclip.pro exists, UPDATE it
UPDATE users 
SET 
  password_hash = '$2a$10$YIjlrly3/VQ8YSFK7s/1B.6Lb.3YCi6AblTxFPfJ.8IiT4/Hl0dJe',  -- bcrypt hash of Admin123!
  role = 'ADMIN',
  username = 'admin'
WHERE email = 'admin@eclip.pro';

-- OPTION 2: If admin@eclip.pro doesn't exist, INSERT it
INSERT INTO users (
  email, 
  username, 
  password_hash, 
  role, 
  level, 
  xp, 
  esr, 
  rank, 
  coins,
  email_verified, 
  email_verification_token,
  steam_id,
  avatar_url,
  created_at,
  updated_at
) 
SELECT
  'admin@eclip.pro',
  'admin',
  '$2a$10$YIjlrly3/VQ8YSFK7s/1B.6Lb.3YCi6AblTxFPfJ.8IiT4/Hl0dJe',  -- bcrypt hash of Admin123!
  'ADMIN',
  100,
  50000,
  5000,
  'Radiant',
  '10000',
  true,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@eclip.pro');

-- Verify admin user exists:
SELECT id, email, username, role, level, xp, esr, rank FROM users WHERE email = 'admin@eclip.pro';
