#!/usr/bin/env node
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function main() {
  try {
    console.log('🚀 Starting TIER 1 migrations...\n');

    // 1. Create new tables
    console.log('📝 Creating new tables...');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS achievement_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        achievement_id UUID,
        current_progress INTEGER DEFAULT 0 NOT NULL,
        unlocked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('  ✓ achievement_progress');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT NOT NULL,
        permission TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(role, permission)
      );
    `);
    console.log('  ✓ role_permissions');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS esr_thresholds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tier TEXT NOT NULL UNIQUE,
        min_esr INTEGER NOT NULL,
        max_esr INTEGER NOT NULL,
        color TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('  ✓ esr_thresholds');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS level_thresholds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        level INTEGER NOT NULL UNIQUE,
        required_xp INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('  ✓ level_thresholds');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        wins_today INTEGER DEFAULT 0,
        matches_today INTEGER DEFAULT 0,
        assists_today INTEGER DEFAULT 0,
        hs_kills_today INTEGER DEFAULT 0,
        dashboard_visit_today BOOLEAN DEFAULT FALSE,
        kills_total INTEGER DEFAULT 0,
        hs_kills INTEGER DEFAULT 0,
        clutches_won INTEGER DEFAULT 0,
        bomb_plants INTEGER DEFAULT 0,
        bomb_defuses INTEGER DEFAULT 0,
        assists_total INTEGER DEFAULT 0,
        damage_total INTEGER DEFAULT 0,
        aces_done INTEGER DEFAULT 0,
        last_reset_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('  ✓ user_metrics');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        rarity TEXT,
        image_url TEXT,
        unlock_type TEXT,
        unlock_ref_id UUID,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('  ✓ badges');

    console.log('✅ All new tables created\n');

    // 2. Seed ESR thresholds
    console.log('📝 Seeding ESR thresholds...');
    await sql.unsafe(`
      INSERT INTO esr_thresholds (tier, min_esr, max_esr, color)
      VALUES
        ('Beginner', 0, 400, '#808080'),
        ('Rookie', 400, 800, '#87CEEB'),
        ('Pro', 800, 1500, '#90EE90'),
        ('Ace', 1500, 2200, '#FFD700'),
        ('Legend', 2200, 5000, '#FF6347')
      ON CONFLICT (tier) DO NOTHING;
    `);
    console.log('✅ ESR thresholds seeded\n');

    // 3. Seed level thresholds
    console.log('📝 Seeding level thresholds (1-100)...');
    for (let i = 1; i <= 100; i++) {
      await sql.unsafe(`
        INSERT INTO level_thresholds (level, required_xp)
        VALUES ($1, $2)
        ON CONFLICT (level) DO NOTHING;
      `, [i, i * 1000]);
      if (i % 25 === 0) process.stdout.write(`  ✓ Levels 1-${i}\n`);
    }
    console.log('✅ Level thresholds seeded\n');

    // 4. Seed role permissions
    console.log('📝 Seeding role permissions...');
    const permissions = {
      ADMIN: [
        'access_admin_panel', 'access_moderator_panel', 'access_insider_panel', 'access_vip_panel',
        'edit_site_settings', 'edit_landing_page', 'create_edit_missions', 'create_edit_achievements',
        'create_edit_badges', 'force_esr_adjustment', 'ban_users', 'mute_users', 'view_anticheat_events',
        'review_anticheat_flags', 'manage_vip_insider', 'access_insider_features', 'access_vip_cosmetics'
      ],
      MODERATOR: [
        'access_moderator_panel', 'access_insider_panel', 'access_vip_panel', 'ban_users_limited',
        'mute_users', 'view_anticheat_events', 'review_anticheat_flags', 'access_insider_features', 'access_vip_cosmetics'
      ],
      INSIDER: [
        'access_insider_panel', 'access_vip_panel', 'access_insider_features', 'access_vip_cosmetics'
      ],
      VIP: [
        'access_vip_panel', 'access_vip_cosmetics', 'vip_queue_priority', 'vip_cosmetic_discounts'
      ],
      USER: [
        'access_player_profile', 'access_leaderboards', 'participate_missions', 'unlock_achievements'
      ]
    };

    for (const [role, perms] of Object.entries(permissions)) {
      for (const perm of perms) {
        await sql.unsafe(`
          INSERT INTO role_permissions (role, permission)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [role, perm]);
      }
      console.log(`  ✓ ${role} (${perms.length} permissions)`);
    }
    console.log('✅ Role permissions seeded\n');

    // 5. Create indices
    console.log('📝 Creating performance indices...');
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
      CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
      CREATE INDEX IF NOT EXISTS idx_esr_thresholds_tier ON esr_thresholds(tier);
      CREATE INDEX IF NOT EXISTS idx_level_thresholds_level ON level_thresholds(level);
      CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
    `);
    console.log('✅ Indices created\n');

    console.log('✅✅✅ TIER 1 MIGRATION COMPLETE! ✅✅✅\n');
    console.log('Database is now ready for:');
    console.log('  ✓ 55 Missions (5 daily + 50 main)');
    console.log('  ✓ 50+ Achievements');
    console.log('  ✓ 50+ Badges');
    console.log('  ✓ Role-based permissions');
    console.log('  ✓ ESR ranking system');
    console.log('  ✓ Real-time metrics tracking\n');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
