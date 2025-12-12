-- Add VIP columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vip_expires_at timestamp,
ADD COLUMN IF NOT EXISTS vip_auto_renew boolean DEFAULT false;

-- Create VIP Subscriptions table
CREATE TABLE IF NOT EXISTS vip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  renewal_day INTEGER,
  total_cost_coins INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active',
  cancelled_at TIMESTAMP,
  cancel_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_user_id ON vip_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_expires_at ON vip_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_status ON vip_subscriptions(status);

-- Update users table to have VIP role color based on role
UPDATE users SET role_color = '#FF1493' WHERE role = 'ADMIN' AND role_color IS NULL;
UPDATE users SET role_color = '#FF8C00' WHERE role = 'MODERATOR' AND role_color IS NULL;
UPDATE users SET role_color = '#FFD700' WHERE role = 'VIP' AND role_color IS NULL;
UPDATE users SET role_color = '#87CEEB' WHERE role = 'INSIDER' AND role_color IS NULL;
UPDATE users SET role_color = '#808080' WHERE role = 'USER' AND role_color IS NULL;
