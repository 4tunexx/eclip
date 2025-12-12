/**
 * Quick setup script for daily login mission
 * Just copy-paste the SQL into your database
 */

const sql = `
-- Create Daily Login Mission
INSERT INTO missions (
  id,
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
  'daily-login-' || gen_random_uuid(),
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
) ON CONFLICT DO NOTHING;

-- Check if it was created
SELECT id, name, description, reward_xp, reward_coins FROM missions WHERE name = 'Daily Login Bonus' LIMIT 1;
`;

console.log('=== DAILY LOGIN MISSION SETUP ===\n');
console.log('Copy and paste this SQL into your database (Neon console):\n');
console.log('---');
console.log(sql);
console.log('---\n');
console.log('This will create a mission that:');
console.log('✅ Grants 50 XP per daily login');
console.log('✅ Grants 25 coins per daily login');
console.log('✅ Tracked automatically when users visit');
console.log('✅ Available in DAILY category\n');
