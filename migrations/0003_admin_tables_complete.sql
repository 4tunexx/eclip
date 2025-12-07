-- Ensure all admin tables exist with proper structure
-- This migration creates/updates tables for the complete admin panel

-- Cosmetics table (if not exists)
CREATE TABLE IF NOT EXISTS cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Frame', 'Banner', 'Badge', 'Title')),
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User inventory for cosmetics
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cosmetic_id UUID NOT NULL REFERENCES cosmetics(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('DAILY', 'WEEKLY', 'ACHIEVEMENT')),
  requirements JSONB NOT NULL DEFAULT '[]',
  rewards JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User missions progress
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  progress JSONB NOT NULL DEFAULT '{}',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirements JSONB NOT NULL DEFAULT '[]',
  rewards JSONB NOT NULL DEFAULT '{}',
  rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Site configuration
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Anti-cheat logs
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  detection_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED', 'CONFIRMED')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cosmetics_type ON cosmetics(type);
CREATE INDEX IF NOT EXISTS idx_cosmetics_rarity ON cosmetics(rarity);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_logs_user_id ON anti_cheat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_logs_status ON anti_cheat_logs(status);

-- Update trigger for cosmetics
CREATE OR REPLACE FUNCTION update_cosmetics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cosmetics_updated_at ON cosmetics;
CREATE TRIGGER trigger_cosmetics_updated_at
  BEFORE UPDATE ON cosmetics
  FOR EACH ROW
  EXECUTE FUNCTION update_cosmetics_updated_at();

-- Update trigger for missions
DROP TRIGGER IF EXISTS trigger_missions_updated_at ON missions;
CREATE TRIGGER trigger_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_cosmetics_updated_at();
