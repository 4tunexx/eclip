-- Rename MMR columns to ESR and drop legacy duplicate column
ALTER TABLE users RENAME COLUMN mmr TO esr;
ALTER TABLE users DROP COLUMN IF EXISTS esr_rating;
ALTER TABLE users ALTER COLUMN esr SET DEFAULT 1000;

ALTER TABLE queue_tickets RENAME COLUMN mmr_at_join TO esr_at_join;