-- Add division column and composite uniqueness for ESR thresholds
ALTER TABLE esr_thresholds
  ADD COLUMN IF NOT EXISTS division integer NOT NULL DEFAULT 1;

-- Drop old unique constraint on tier if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'esr_thresholds'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'esr_thresholds_tier_unique'
  ) THEN
    ALTER TABLE esr_thresholds DROP CONSTRAINT esr_thresholds_tier_unique;
  END IF;
END$$;

-- Ensure composite uniqueness on (tier, division)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'esr_thresholds'
      AND constraint_name = 'esr_threshold_tier_division_idx'
  ) THEN
    ALTER TABLE esr_thresholds ADD CONSTRAINT esr_threshold_tier_division_idx UNIQUE (tier, division);
  END IF;
END$$;

-- Reset and seed 15 divisions (5 tiers x 3 divisions)
TRUNCATE TABLE esr_thresholds RESTART IDENTITY;

INSERT INTO esr_thresholds (tier, division, min_esr, max_esr, color) VALUES
  ('Beginner', 1, 0, 166, '#808080'),
  ('Beginner', 2, 167, 333, '#808080'),
  ('Beginner', 3, 334, 500, '#808080'),
  ('Rookie',   1, 500, 666, '#90EE90'),
  ('Rookie',   2, 667, 833, '#90EE90'),
  ('Rookie',   3, 834, 1000, '#90EE90'),
  ('Pro',      1, 1000, 1333, '#4169E1'),
  ('Pro',      2, 1334, 1666, '#4169E1'),
  ('Pro',      3, 1667, 2000, '#4169E1'),
  ('Ace',      1, 2000, 2500, '#FFD700'),
  ('Ace',      2, 2501, 3000, '#FFD700'),
  ('Ace',      3, 3001, 3500, '#FFD700'),
  ('Legend',   1, 3500, 4000, '#FF1493'),
  ('Legend',   2, 4001, 4500, '#FF1493'),
  ('Legend',   3, 4501, 5000, '#FF1493');
