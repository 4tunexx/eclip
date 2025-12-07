-- Add metadata column to cosmetics table to store gradient/border/animation data
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update existing cosmetics to have default metadata based on type
UPDATE cosmetics 
SET metadata = jsonb_build_object(
  'gradient', 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, rgb(139 92 246 / 0.2) 50%, rgb(59 130 246 / 0.2) 100%)'
)
WHERE type = 'Banner' AND metadata IS NULL;

UPDATE cosmetics 
SET metadata = jsonb_build_object(
  'border_color', '#9333ea',
  'border_width', 3,
  'border_style', 'solid',
  'shadow_color', 'rgba(147, 51, 234, 0.3)',
  'animation_type', 'none',
  'animation_speed', 5
)
WHERE type = 'Frame' AND metadata IS NULL;
