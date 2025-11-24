CREATE TABLE IF NOT EXISTS ac_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  flag_type TEXT,
  score REAL NOT NULL,
  description TEXT,
  label TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smurf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  last_evaluated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS match_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  validated BOOLEAN DEFAULT FALSE,
  notes TEXT
);