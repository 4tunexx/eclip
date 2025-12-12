-- Daily Login Mission
-- This mission is automatically tracked when a user logs in

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
) ON CONFLICT DO NOTHING;
