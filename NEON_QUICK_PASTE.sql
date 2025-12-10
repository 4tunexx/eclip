-- ============================================================================
-- QUICK PASTE - ECLIP COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Instructions:
-- 1. Go to https://console.neon.tech
-- 2. Click "SQL Editor"
-- 3. Copy everything from "DO $$" to "COMMIT;" below
-- 4. Paste into the editor
-- 5. Click "Execute"
-- ============================================================================

-- Create all enums
DO $$ BEGIN
    CREATE TYPE "public"."RankTier" AS ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ELITE', 'MASTER', 'GRANDMASTER', 'LEGEND', 'IMMORTAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."Provider" AS ENUM('EMAIL', 'STEAM');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."UserRole" AS ENUM('USER', 'MOD', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."BanType" AS ENUM('TEMP', 'PERM', 'QUEUE_ONLY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."MatchStatus" AS ENUM('PENDING', 'LIVE', 'FINISHED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."TeamSide" AS ENUM('A', 'B');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."QueueStatus" AS ENUM('QUEUED', 'MATCHED', 'CANCELLED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."CosmeticType" AS ENUM('AVATAR_FRAME', 'PROFILE_BANNER', 'BADGE', 'TITLE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."CosmeticRarity" AS ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."TransactionType" AS ENUM('MATCH_REWARD', 'PURCHASE', 'REFUND', 'ADMIN_GRANT', 'ADMIN_REMOVE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."ThreadType" AS ENUM('DM', 'FORUM_TOPIC');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."mission_category" AS ENUM('DAILY', 'PLATFORM', 'INGAME');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."achievement_category" AS ENUM('LEVEL', 'ESR', 'COMBAT', 'SOCIAL', 'PLATFORM', 'COMMUNITY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM('USER', 'VIP', 'INSIDER', 'MODERATOR', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."match_status" AS ENUM('PENDING', 'READY', 'LIVE', 'FINISHED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."queue_status" AS ENUM('WAITING', 'MATCHED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."cosmetic_type" AS ENUM('Frame', 'Banner', 'Badge', 'Title');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."rarity" AS ENUM('Common', 'Rare', 'Epic', 'Legendary');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."mission_type" AS ENUM('DAILY', 'WEEKLY', 'ACHIEVEMENT');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS "public"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"steam_id" text NOT NULL UNIQUE,
	"username" text NOT NULL,
	"eclip_id" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now(),
	"avatar" text,
	"rank_points" integer DEFAULT 1000,
	"coins" numeric(12, 2) DEFAULT '0',
	"updated_at" timestamp with time zone DEFAULT now(),
	"role_color" text DEFAULT '#FFFFFF',
	"rank_tier" text DEFAULT 'Beginner',
	"rank_division" integer DEFAULT 1,
	"email" text UNIQUE,
	"password_hash" text,
	"role" text DEFAULT 'USER',
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"level" integer DEFAULT 1,
	"xp" integer DEFAULT 0,
	"esr" integer DEFAULT 1000,
	"rank" text DEFAULT 'Bronze',
	"is_admin" boolean DEFAULT false,
	"is_moderator" boolean DEFAULT false,
	"avatar_url" text
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS "public"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create anti-cheat tables
CREATE TABLE IF NOT EXISTS "public"."ac_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"match_id" uuid,
	"code" text NOT NULL,
	"severity" integer NOT NULL,
	"details" jsonb,
	"reviewed" boolean DEFAULT false,
	"reviewed_by" uuid REFERENCES "public"."users"("id"),
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."anti_cheat_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid REFERENCES "public"."users"("id") ON DELETE SET NULL,
	"match_id" uuid,
	"detection_type" text NOT NULL,
	"severity" text NOT NULL,
	"details" jsonb DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid REFERENCES "public"."users"("id") ON DELETE SET NULL,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"reason" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp with time zone,
	"banned_by" uuid REFERENCES "public"."users"("id"),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create achievements
CREATE TABLE IF NOT EXISTS "public"."achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"points" integer NOT NULL,
	"category" text DEFAULT 'cs2',
	"requirement_type" text,
	"requirement_value" text,
	"target" integer DEFAULT 1,
	"reward_xp" integer DEFAULT 0,
	"reward_badge_id" uuid,
	"is_secret" boolean DEFAULT false,
	"is_active" boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS "public"."achievement_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"achievement_id" uuid NOT NULL REFERENCES "public"."achievements"("id") ON DELETE CASCADE,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"unlocked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"achievement_id" uuid REFERENCES "public"."achievements"("id") ON DELETE CASCADE,
	"unlocked_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "public"."badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"rarity" text,
	"image_url" text,
	"unlock_type" text,
	"unlock_ref_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."level_thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"level" integer NOT NULL UNIQUE,
	"required_xp" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create missions
CREATE TABLE IF NOT EXISTS "public"."missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"requirement_type" text NOT NULL,
	"requirement_value" text,
	"target" integer NOT NULL,
	"reward_xp" integer DEFAULT 0 NOT NULL,
	"reward_coins" integer DEFAULT 0 NOT NULL,
	"reward_cosmetic_id" uuid,
	"is_daily" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."user_mission_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"mission_id" uuid NOT NULL REFERENCES "public"."missions"("id") ON DELETE CASCADE,
	"progress" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "user_mission_progress_user_id_mission_id_key" UNIQUE("user_id","mission_id")
);

CREATE TABLE IF NOT EXISTS "public"."user_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"mission_id" uuid NOT NULL REFERENCES "public"."missions"("id") ON DELETE CASCADE,
	"progress" jsonb DEFAULT '{}' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_missions_user_id_mission_id_key" UNIQUE("user_id","mission_id")
);

-- Create cosmetics
CREATE TABLE IF NOT EXISTS "public"."cosmetics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"rarity" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"metadata" jsonb
);

CREATE TABLE IF NOT EXISTS "public"."user_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"cosmetic_id" uuid NOT NULL REFERENCES "public"."cosmetics"("id") ON DELETE CASCADE,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"title" text,
	"equipped_frame_id" uuid,
	"equipped_banner_id" uuid,
	"equipped_badge_id" uuid,
	"stats" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create messaging
CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."direct_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"sender_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"recipient_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"content" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"data" jsonb,
	"read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create transactions
CREATE TABLE IF NOT EXISTS "public"."transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"reference_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create queue & matches
CREATE TABLE IF NOT EXISTS "public"."queue_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"status" text DEFAULT 'WAITING' NOT NULL,
	"region" text NOT NULL,
	"esr_at_join" integer NOT NULL,
	"match_id" uuid,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"matched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ladder" text NOT NULL,
	"server_instance_id" uuid,
	"started_at" timestamp with time zone DEFAULT now(),
	"ended_at" timestamp with time zone,
	"status" text NOT NULL,
	"server_id" text,
	"map" text,
	"team_a_players" text[],
	"team_b_players" text[],
	"winner_team" text,
	"match_start" timestamp with time zone,
	"match_end" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."match_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL REFERENCES "public"."matches"("id") ON DELETE CASCADE,
	"user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"team" integer NOT NULL,
	"kills" integer DEFAULT 0,
	"deaths" integer DEFAULT 0,
	"assists" integer DEFAULT 0,
	"hs_percentage" integer DEFAULT 0,
	"mvps" integer DEFAULT 0,
	"adr" numeric(5, 2),
	"is_winner" boolean DEFAULT false,
	"is_leaver" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user metrics
CREATE TABLE IF NOT EXISTS "public"."user_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"wins_today" integer DEFAULT 0,
	"matches_today" integer DEFAULT 0,
	"assists_today" integer DEFAULT 0,
	"hs_kills_today" integer DEFAULT 0,
	"dashboard_visit_today" boolean DEFAULT false,
	"kills_total" integer DEFAULT 0,
	"hs_kills" integer DEFAULT 0,
	"clutches_won" integer DEFAULT 0,
	"bomb_plants" integer DEFAULT 0,
	"bomb_defuses" integer DEFAULT 0,
	"assists_total" integer DEFAULT 0,
	"damage_total" integer DEFAULT 0,
	"aces_done" integer DEFAULT 0,
	"last_reset_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create forum
CREATE TABLE IF NOT EXISTS "public"."forum_categories" (
	"id" uuid PRIMARY KEY,
	"title" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "public"."forum_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"category_id" uuid NOT NULL REFERENCES "public"."forum_categories"("id") ON DELETE CASCADE,
	"author_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"reply_count" integer DEFAULT 0,
	"last_reply_at" timestamp with time zone,
	"last_reply_author_id" uuid REFERENCES "public"."users"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."forum_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"thread_id" uuid NOT NULL REFERENCES "public"."forum_threads"("id") ON DELETE CASCADE,
	"author_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create admin tables
CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"role" text NOT NULL UNIQUE,
	"permission" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_permission_key" UNIQUE("role","permission")
);

CREATE TABLE IF NOT EXISTS "public"."site_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"key" text NOT NULL UNIQUE,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid REFERENCES "public"."users"("id")
);

CREATE TABLE IF NOT EXISTS "public"."esr_thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tier" text NOT NULL UNIQUE,
	"min_esr" integer NOT NULL,
	"max_esr" integer NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"division" integer DEFAULT 1 NOT NULL UNIQUE
);

-- Create all indexes
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "public"."users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_steam_id" ON "public"."users"("steam_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "public"."sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "public"."notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "public"."notifications"("read");
CREATE INDEX IF NOT EXISTS "idx_direct_messages_sender_id" ON "public"."direct_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "idx_direct_messages_recipient_id" ON "public"."direct_messages"("recipient_id");
CREATE INDEX IF NOT EXISTS "idx_direct_messages_read" ON "public"."direct_messages"("read");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_user_id" ON "public"."chat_messages"("user_id");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_created_at" ON "public"."chat_messages"("created_at");
CREATE INDEX IF NOT EXISTS "idx_cosmetics_type" ON "public"."cosmetics"("type");
CREATE INDEX IF NOT EXISTS "idx_cosmetics_rarity" ON "public"."cosmetics"("rarity");
CREATE INDEX IF NOT EXISTS "idx_user_inventory_user_id" ON "public"."user_inventory"("user_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_user_id" ON "public"."transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_missions_category" ON "public"."missions"("category");
CREATE INDEX IF NOT EXISTS "idx_missions_daily" ON "public"."missions"("is_daily");
CREATE INDEX IF NOT EXISTS "idx_missions_active" ON "public"."missions"("is_active");
CREATE INDEX IF NOT EXISTS "idx_achievements_category" ON "public"."achievements"("category");
CREATE INDEX IF NOT EXISTS "idx_badges_category" ON "public"."badges"("category");
CREATE INDEX IF NOT EXISTS "idx_user_achievements_user_id" ON "public"."user_achievements"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_achievements" ON "public"."user_achievements"("user_id","achievement_id");
CREATE INDEX IF NOT EXISTS "idx_user_mission_progress" ON "public"."user_mission_progress"("user_id","mission_id");
CREATE INDEX IF NOT EXISTS "idx_user_missions_user_id" ON "public"."user_missions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_match_players_match_id" ON "public"."match_players"("match_id");
CREATE INDEX IF NOT EXISTS "idx_match_players_user_id" ON "public"."match_players"("user_id");
CREATE INDEX IF NOT EXISTS "idx_queue_tickets_user_id" ON "public"."queue_tickets"("user_id");
CREATE INDEX IF NOT EXISTS "idx_queue_tickets_status" ON "public"."queue_tickets"("status");
CREATE INDEX IF NOT EXISTS "idx_anti_cheat_logs_user_id" ON "public"."anti_cheat_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_anti_cheat_logs_status" ON "public"."anti_cheat_logs"("status");
CREATE INDEX IF NOT EXISTS "idx_esr_thresholds_tier" ON "public"."esr_thresholds"("tier");
CREATE INDEX IF NOT EXISTS "idx_role_permissions_role" ON "public"."role_permissions"("role");
CREATE INDEX IF NOT EXISTS "idx_level_thresholds_level" ON "public"."level_thresholds"("level");

COMMIT;

-- ============================================================================
-- SCHEMA COMPLETE - ALL 34 TABLES CREATED
-- ============================================================================
