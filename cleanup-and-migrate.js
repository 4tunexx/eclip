#!/usr/bin/env node
/**
 * CLEANUP & MIGRATION SCRIPT
 * - Drops unused tables
 * - Adds missing columns
 * - Fixes schema misalignments
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║           DATABASE CLEANUP & MIGRATION                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // 1. DROP UNUSED TABLES
    console.log('🗑️  DROPPING UNUSED TABLES:\n');
    
    const unusedTables = [
      'leaderboards',      // API queries users table directly
      'user_cosmetics',    // Use user_inventory instead
      'user_subscriptions', // No VIP system
      'vip_tiers'          // Not used in code
    ];

    for (const table of unusedTables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`  ✅ Dropped: ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to drop ${table}: ${error.message}`);
      }
    }

    // 2. CHECK & ADD MISSING COLUMNS TO USERS TABLE
    console.log('\n📝 FIXING USERS TABLE:\n');

    // Check if is_vip exists
    const isVipCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_vip'
    `);

    if (isVipCheck.rows.length === 0) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN is_vip BOOLEAN DEFAULT false`);
        console.log(`  ✅ Added: is_vip column`);
      } catch (e) {
        console.log(`  ⚠️  is_vip already exists or error: ${e.message}`);
      }
    }

    // Check if vip_expires_at exists
    const vipExpiresCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'vip_expires_at'
    `);

    if (vipExpiresCheck.rows.length === 0) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN vip_expires_at TIMESTAMP WITH TIME ZONE`);
        console.log(`  ✅ Added: vip_expires_at column`);
      } catch (e) {
        console.log(`  ⚠️  vip_expires_at already exists or error: ${e.message}`);
      }
    }

    // Check if vip_auto_renew exists
    const vipAutoRenewCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'vip_auto_renew'
    `);

    if (vipAutoRenewCheck.rows.length === 0) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN vip_auto_renew BOOLEAN DEFAULT false`);
        console.log(`  ✅ Added: vip_auto_renew column`);
      } catch (e) {
        console.log(`  ⚠️  vip_auto_renew already exists or error: ${e.message}`);
      }
    }

    // 3. ADD MISSING COLUMN TO MATCHES TABLE (if needed)
    console.log('\n📝 FIXING MATCHES TABLE:\n');

    // Check if all required columns exist
    const matchCols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'matches'
      ORDER BY column_name
    `);

    const matchColumns = matchCols.rows.map(r => r.column_name);
    console.log(`  ✅ Matches table has ${matchColumns.length} columns`);

    // 4. VERIFY CRITICAL TABLES
    console.log('\n✅ VERIFYING CRITICAL TABLES:\n');

    const criticalCheck = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name=t.table_name) as col_count,
             (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema='public' AND table_name=t.table_name) as constraint_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const criticalTables = [
      'users', 'sessions', 'matches', 'match_players', 'cosmetics', 'user_inventory',
      'achievements', 'user_achievements', 'missions', 'user_mission_progress',
      'notifications', 'badges', 'role_permissions', 'esr_thresholds', 'level_thresholds'
    ];

    for (const table of criticalTables) {
      const row = criticalCheck.rows.find(r => r.table_name === table);
      if (row) {
        console.log(`  ✅ ${table.padEnd(30)} | Cols: ${row.col_count.toString().padEnd(2)} | Constraints: ${row.constraint_count}`);
      } else {
        console.log(`  ❌ ${table.padEnd(30)} | MISSING!`);
      }
    }

    // 5. FINAL STATISTICS
    console.log('\n' + '═'.repeat(58));
    console.log('\n📊 FINAL DATABASE STATE:\n');

    const finalTables = await pool.query(`
      SELECT COUNT(*) as total_tables FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log(`  Total tables: ${finalTables.rows[0].total_tables}`);

    const userCount = await pool.query(`SELECT COUNT(*) as cnt FROM users`);
    console.log(`  Users: ${userCount.rows[0].cnt}`);

    const matchCount = await pool.query(`SELECT COUNT(*) as cnt FROM matches`);
    console.log(`  Matches: ${matchCount.rows[0].cnt}`);

    const cosmeticCount = await pool.query(`SELECT COUNT(*) as cnt FROM cosmetics`);
    console.log(`  Cosmetics: ${cosmeticCount.rows[0].cnt}`);

    console.log('\n✅ Migration complete!\n');
    await pool.end();
  } catch (error) {
    console.error('\n❌ MIGRATION ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

migrate();
