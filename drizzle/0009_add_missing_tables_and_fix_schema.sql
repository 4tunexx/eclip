-- drizzle/0009_add_missing_tables_and_fix_schema.sql
-- Adds missing tables (anti_cheat_logs, user_missions) and fixes timestamp inconsistencies

-- ============================================================================
-- SECTION 1: ADD MISSING TABLES
-- ============================================================================

-- Anti-Cheat Logs (duplicate of ac_events or separate table?)
CREATE TABLE IF NOT EXISTS "anti_cheat_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "match_id" uuid,
  "code" text NOT NULL,
  "severity" integer NOT NULL,
  "details" jsonb,
  "reviewed" boolean DEFAULT false,
  "reviewed_by" uuid,
  "reviewed_at" timestamp with time zone,
  "status" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT "anti_cheat_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "anti_cheat_logs_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE,
  CONSTRAINT "anti_cheat_logs_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "idx_anti_cheat_logs_user_id" ON "anti_cheat_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_anti_cheat_logs_status" ON "anti_cheat_logs" ("status");

-- User Missions (relationship between users and missions)
CREATE TABLE IF NOT EXISTS "user_missions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "mission_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT "user_missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "user_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE,
  CONSTRAINT "user_missions_user_id_mission_id_key" UNIQUE ("user_id", "mission_id")
);

CREATE INDEX IF NOT EXISTS "idx_user_missions_user_id" ON "user_missions" ("user_id");

-- ============================================================================
-- SECTION 2: FIX TIMESTAMP COLUMNS (Add WITH TIME ZONE where missing)
-- ============================================================================

-- chat_messages: Add timezone
ALTER TABLE "chat_messages" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';

-- cosmetics: Add timezone
ALTER TABLE "cosmetics" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING COALESCE("created_at" AT TIME ZONE 'UTC', now());
ALTER TABLE "cosmetics" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING COALESCE("updated_at" AT TIME ZONE 'UTC', now());

-- badges: Add timezone
ALTER TABLE "badges" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';
ALTER TABLE "badges" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at" AT TIME ZONE 'UTC';

-- esr_thresholds: Add timezone
ALTER TABLE "esr_thresholds" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';

-- forum_categories: Add timezone
ALTER TABLE "forum_categories" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING COALESCE("created_at" AT TIME ZONE 'UTC', now());

-- level_thresholds: Add timezone
ALTER TABLE "level_thresholds" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';

-- missions: Add timezone
ALTER TABLE "missions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING COALESCE("created_at" AT TIME ZONE 'UTC', now());
ALTER TABLE "missions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING COALESCE("updated_at" AT TIME ZONE 'UTC', now());

-- role_permissions: Add timezone
ALTER TABLE "role_permissions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';

-- user_mission_progress: Add timezone (already WITH TZ but making explicit)
-- Note: user_mission_progress.created_at, updated_at already have timezone from initial query
-- If needed, run: ALTER TABLE "user_mission_progress" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;

-- ============================================================================
-- SECTION 3: ADD ANY MISSING COLUMNS
-- ============================================================================

-- Add level_computed to users if not present
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "level_computed" integer GENERATED ALWAYS AS (CAST(COALESCE("xp", 0) / 100 + 1 AS integer)) STORED;

-- ============================================================================
-- SECTION 4: VERIFY ENUM CONSISTENCY
-- ============================================================================

-- Note: Database has multiple enum types. These should be consolidated.
-- For now, documenting existing enums:
-- - user_role: [USER, VIP, INSIDER, MODERATOR, ADMIN]
-- - match_status: [PENDING, READY, LIVE, FINISHED, CANCELLED]
-- - queue_status: [WAITING, MATCHED, CANCELLED]
-- - cosmetic_type: [Frame, Banner, Badge, Title]
-- - rarity: [Common, Rare, Epic, Legendary]
-- - mission_type: [DAILY, WEEKLY, ACHIEVEMENT]
-- - mission_category: [DAILY, PLATFORM, INGAME]
-- - achievement_category: [LEVEL, ESR, COMBAT, SOCIAL, PLATFORM, COMMUNITY]
-- And others: BanType, CosmeticRarity, CosmeticType, MatchStatus, Provider, QueueStatus, RankTier, TeamSide, ThreadType, TransactionType, UserRole

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This migration:
-- ✅ Adds anti_cheat_logs table with proper constraints
-- ✅ Adds user_missions table with proper constraints
-- ✅ Fixes timestamp columns to use WITH TIME ZONE
-- ✅ Adds level_computed computed column to users
-- ✅ Creates necessary indexes
-- All operations are safe to run multiple times
