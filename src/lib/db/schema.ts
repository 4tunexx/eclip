// Database schema types - align with actual database tables created by fix-schema.js and seed-complete.js
// Import from drizzle-orm for type-safe queries
import { pgTable, text, timestamp, uuid, integer, decimal, boolean, jsonb, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

// Enums (legacy values retained for other tables)
export const userRoleEnum = pgEnum('user_role', ['USER', 'VIP', 'INSIDER', 'MODERATOR', 'ADMIN']);
export const matchStatusEnum = pgEnum('match_status', ['PENDING', 'READY', 'LIVE', 'FINISHED', 'CANCELLED']);
export const queueStatusEnum = pgEnum('queue_status', ['WAITING', 'MATCHED', 'CANCELLED']);
export const cosmeticTypeEnum = pgEnum('cosmetic_type', ['Frame', 'Banner', 'Badge', 'Title']);
export const rarityEnum = pgEnum('rarity', ['Common', 'Rare', 'Epic', 'Legendary']);
export const missionTypeEnum = pgEnum('mission_type', ['DAILY', 'WEEKLY', 'ACHIEVEMENT']);
export const missionCategoryEnum = pgEnum('mission_category', ['DAILY', 'PLATFORM', 'INGAME']);
export const achievementCategoryEnum = pgEnum('achievement_category', ['LEVEL', 'ESR', 'COMBAT', 'SOCIAL', 'PLATFORM', 'COMMUNITY']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash'),
  steamId: text('steam_id').unique(),
  avatarUrl: text('avatar_url'),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
  esr: integer('esr').default(1000).notNull(),
  rank: text('rank').default('Bronze').notNull(),
  coins: decimal('coins', { precision: 10, scale: 2 }).default('0').notNull(),
  role: userRoleEnum('role').default('USER').notNull(),
  roleColor: text('role_color').default('#FFFFFF'),
  rankTier: text('rank_tier').default('Beginner').notNull(),
  rankDivision: integer('rank_division').default(1).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailVerificationToken: text('email_verification_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Profiles (extended profile data)
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  title: text('title'),
  equippedFrameId: uuid('equipped_frame_id'),
  equippedBannerId: uuid('equipped_banner_id'),
  equippedBadgeId: uuid('equipped_badge_id'),
  stats: jsonb('stats'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cosmetics table
export const cosmetics = pgTable('cosmetics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: cosmeticTypeEnum('type').notNull(),
  rarity: rarityEnum('rarity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Inventory
export const userInventory = pgTable('user_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cosmeticId: uuid('cosmetic_id').references(() => cosmetics.id, { onDelete: 'cascade' }).notNull(),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
});

// Matches table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: matchStatusEnum('status').default('PENDING').notNull(),
  map: text('map'),
  mapImageUrl: text('map_image_url'),
  serverHost: text('server_host'),
  serverPort: integer('server_port'),
  scoreTeam1: integer('score_team1').default(0),
  scoreTeam2: integer('score_team2').default(0),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Match Players (stats per player per match)
export const matchPlayers = pgTable('match_players', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  team: integer('team').notNull(),
  kills: integer('kills').default(0),
  deaths: integer('deaths').default(0),
  assists: integer('assists').default(0),
  hsPercentage: integer('hs_percentage').default(0),
  mvps: integer('mvps').default(0),
  adr: decimal('adr', { precision: 5, scale: 2 }),
  isWinner: boolean('is_winner').default(false),
  isLeaver: boolean('is_leaver').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Queue Tickets
export const queueTickets = pgTable('queue_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: queueStatusEnum('status').default('WAITING').notNull(),
  region: text('region').notNull(),
  esrAtJoin: integer('esr_at_join').notNull(),
  matchId: uuid('match_id').references(() => matches.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  matchedAt: timestamp('matched_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Missions - actual DB schema
export const missions = pgTable('missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  requirementType: text('requirement_type').notNull(),
  requirementValue: text('requirement_value'),
  target: integer('target').notNull(),
  rewardXp: integer('reward_xp').notNull().default(0),
  rewardCoins: integer('reward_coins').notNull().default(0),
  rewardCosmeticId: uuid('reward_cosmetic_id'),
  isDaily: boolean('is_daily').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Mission Progress - actual DB schema
export const userMissionProgress = pgTable('user_mission_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  missionId: uuid('mission_id').references(() => missions.id, { onDelete: 'cascade' }).notNull(),
  progress: integer('progress').notNull().default(0),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Badges - actual DB schema
export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  rarity: text('rarity').notNull(),
  imageUrl: text('image_url'),
  unlockType: text('unlock_type'),
  unlockRefId: uuid('unlock_ref_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Achievements - actual DB schema
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code'),
  name: text('name').notNull(),
  description: text('description'),
  points: integer('points'),
  category: text('category'),
  requirementType: text('requirement_type'),
  requirementValue: text('requirement_value'),
  target: integer('target'),
  rewardXp: integer('reward_xp').default(0),
  rewardBadgeId: uuid('reward_badge_id').references(() => badges.id),
  isSecret: boolean('is_secret').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Achievements - actual DB schema
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: uuid('achievement_id').references(() => achievements.id, { onDelete: 'cascade' }).notNull(),
  progress: integer('progress').default(0).notNull(),
  unlockedAt: timestamp('unlocked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forum Categories
export const forumCategories = pgTable('forum_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Forum Threads
export const forumThreads = pgTable('forum_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => forumCategories.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  views: integer('views').default(0),
  replyCount: integer('reply_count').default(0),
  lastReplyAt: timestamp('last_reply_at'),
  lastReplyAuthorId: uuid('last_reply_author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forum Posts (replies)
export const forumPosts = pgTable('forum_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Anti-Cheat Events
export const acEvents = pgTable('ac_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  severity: integer('severity').notNull(),
  details: jsonb('details'),
  reviewed: boolean('reviewed').default(false),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bans
export const bans = pgTable('bans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reason: text('reason').notNull(),
  type: text('type').notNull(),
  expiresAt: timestamp('expires_at'),
  bannedBy: uuid('banned_by').references(() => users.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message'),
  data: jsonb('data'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Site Config (Admin settings)
export const siteConfig = pgTable('site_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
});

// Transactions (coin purchases, payouts)
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Achievement Progress Tracking (legacy) - prefer userAchievements
export const achievementProgress = pgTable('achievement_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: uuid('achievement_id').references(() => achievements.id, { onDelete: 'cascade' }).notNull(),
  currentProgress: integer('current_progress').default(0).notNull(),
  unlockedAt: timestamp('unlocked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Role Permissions Matrix
export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: text('role').notNull(),
  permission: text('permission').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ESR Thresholds / Ranking Tiers
export const esrThresholds = pgTable(
  'esr_thresholds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tier: text('tier').notNull(),
    division: integer('division').default(1).notNull(),
    minEsr: integer('min_esr').notNull(),
    maxEsr: integer('max_esr').notNull(),
    color: text('color').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tierDivisionUnique: uniqueIndex('esr_threshold_tier_division_idx').on(
      table.tier,
      table.division,
    ),
  }),
);

// Level Thresholds
export const levelThresholds = pgTable('level_thresholds', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: integer('level').notNull().unique(),
  requiredXp: integer('required_xp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Metrics (for real-time tracking)
export const userMetrics = pgTable('user_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  winsToday: integer('wins_today').default(0),
  matchesToday: integer('matches_today').default(0),
  assistsToday: integer('assists_today').default(0),
  hsKillsToday: integer('hs_kills_today').default(0),
  dashboardVisitToday: boolean('dashboard_visit_today').default(false),
  killsTotal: integer('kills_total').default(0),
  hsKills: integer('hs_kills').default(0),
  clutchesWon: integer('clutches_won').default(0),
  bombPlants: integer('bomb_plants').default(0),
  bombDefuses: integer('bomb_defuses').default(0),
  assistsTotal: integer('assists_total').default(0),
  damageTotal: integer('damage_total').default(0),
  acesDone: integer('aces_done').default(0),
  lastResetAt: timestamp('last_reset_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

