#!/usr/bin/env node

/**
 * VERIFY ALL TABLES EXIST IN DATABASE
 * Compare schema.ts with actual Neon tables
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Expected tables from schema.ts
  const expectedTables = [
    'users', 'sessions', 'user_profiles', 'cosmetics', 'user_inventory',
    'matches', 'match_players', 'match_stats', 'queue_tickets', 'queue_entries',
    'missions', 'user_mission_progress', 'user_missions', 'mission_progress',
    'achievements', 'user_achievements', 'achievement_progress', 'achievements_progress',
    'badges', 'forum_categories', 'forum_threads', 'forum_posts', 'forum_likes',
    'forum_replies', 'ac_events', 'anti_cheat_logs', 'bans', 'notifications',
    'chat_messages', 'direct_messages', 'site_config', 'transactions',
    'role_permissions', 'esr_thresholds', 'level_thresholds', 'user_metrics',
    'blocked_users', 'reports'
  ];

  try {
    await client.connect();
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║           DATABASE TABLE VERIFICATION - SCHEMA vs REALITY                  ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    // Get actual tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const actualTables = new Set(result.rows.map(r => r.table_name));

    console.log(`Expected Tables (from schema.ts): ${expectedTables.length}`);
    console.log(`Actual Tables (in database):      ${actualTables.size}\n`);

    // Check each expected table
    console.log('📊 TABLE VERIFICATION RESULTS:\n');

    const missing = [];
    const present = [];
    const extra = [];

    for (const table of expectedTables) {
      if (actualTables.has(table)) {
        present.push(table);
        const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table.padEnd(30)} : ${count.rows[0].count} rows`);
      } else {
        missing.push(table);
        console.log(`❌ ${table.padEnd(30)} : MISSING`);
      }
    }

    // Check for extra tables
    for (const table of actualTables) {
      if (!expectedTables.includes(table)) {
        extra.push(table);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('📋 SUMMARY\n');
    console.log(`✅ Present:  ${present.length}/${expectedTables.length}`);
    console.log(`❌ Missing:  ${missing.length}/${expectedTables.length}`);
    console.log(`➕ Extra:    ${extra.length}\n`);

    if (missing.length > 0) {
      console.log('❌ MISSING TABLES:');
      missing.forEach(t => console.log(`   - ${t}`));
      console.log('\nThese tables are defined in schema.ts but not in the database.');
      console.log('The app may not function properly without these tables.\n');
    }

    if (extra.length > 0) {
      console.log('➕ EXTRA TABLES (not in schema.ts):');
      extra.forEach(t => console.log(`   - ${t}`));
      console.log('\nThese tables exist in the database but are not used by the app.\n');
    }

    // Health check
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('🔍 HEALTH CHECK\n');

    if (missing.length === 0) {
      console.log('✅ ALL EXPECTED TABLES PRESENT - Database is fully initialized!');
    } else if (missing.length <= 5) {
      console.log('⚠️  Some tables missing - App may have limited functionality');
    } else {
      console.log('❌ Many tables missing - Database initialization incomplete!');
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await client.end();
  }
}

verify();
