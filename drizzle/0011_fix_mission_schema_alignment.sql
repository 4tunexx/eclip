-- drizzle/0011_fix_mission_schema_alignment.sql
-- This migration ensures the missions table schema matches the drizzle schema definition
-- Aligns mission_progress to user_mission_progress for consistency

-- Step 1: Check if the old mission_progress table exists and migrate data if needed
-- This handles the case where 0004 created mission_progress before 0000's user_mission_progress

DO $$ 
BEGIN
  -- If mission_progress exists but user_mission_progress doesn't, we need to merge them
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'mission_progress'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_mission_progress'
  ) THEN
    -- Rename mission_progress to user_mission_progress
    ALTER TABLE mission_progress RENAME TO user_mission_progress;
    
    -- Add missing columns if needed
    ALTER TABLE user_mission_progress 
    ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;
    
    RAISE NOTICE 'Migrated mission_progress to user_mission_progress';
  END IF;
END $$;

-- Step 2: Ensure missions table has all required columns with proper types
-- Add missing columns and fix enum type if needed

ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS type "mission_type" DEFAULT 'DAILY';

ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS objective_type text;

ALTER TABLE missions
ADD COLUMN IF NOT EXISTS objective_value integer;

ALTER TABLE missions
ADD COLUMN IF NOT EXISTS expires_at timestamp;

-- Drop old columns that are being replaced
ALTER TABLE missions 
DROP COLUMN IF EXISTS category CASCADE;

ALTER TABLE missions
DROP COLUMN IF EXISTS requirement_type CASCADE;

ALTER TABLE missions
DROP COLUMN IF EXISTS requirement_value CASCADE;

ALTER TABLE missions
DROP COLUMN IF EXISTS is_daily CASCADE;

ALTER TABLE missions
DROP COLUMN IF EXISTS target CASCADE;

-- Step 3: Ensure user_mission_progress has all required columns
ALTER TABLE user_mission_progress
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_is_active ON missions(is_active);
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(type);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_id ON user_mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_mission_id ON user_mission_progress(mission_id);
