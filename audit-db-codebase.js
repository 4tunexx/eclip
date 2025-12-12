#!/usr/bin/env node
/**
 * COMPREHENSIVE DATABASE AUDIT
 * Compares actual database with codebase usage
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function auditDatabase() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  NEON DATABASE AUDIT - CODEBASE ALIGNMENT CHECK              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. Get all tables and check actual data
    console.log('📊 ACTUAL DATABASE STATE:\n');
    const allTables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);

    const tables = {};
    for (const { table_name } of allTables.rows) {
      const res = await pool.query(`SELECT COUNT(*) as cnt FROM "${table_name}"`);
      tables[table_name] = res.rows[0].cnt;
    }

    // Categorize tables
    const critical = {};
    const optional = {};
    const unused = {};

    const criticalTables = [
      'users', 'sessions', 'matches', 'match_players', 'cosmetics', 'user_inventory',
      'achievements', 'user_achievements', 'missions', 'user_mission_progress',
      'notifications', 'bans', 'transactions', 'role_permissions', 'esr_thresholds',
      'level_thresholds', 'user_profiles', 'badges', 'forum_categories', 'forum_threads',
      'anti_cheat_logs', 'ac_events'
    ];

    const optionalTables = [
      'queue_tickets', 'queue_entries', 'friends', 'blocked_users',
      'chat_messages', 'direct_messages', 'reports', 'match_stats',
      'user_missions', 'mission_progress', 'achievement_progress',
      'forum_posts', 'forum_replies', 'forum_likes', 'site_config',
      'user_metrics', 'anti_cheat_logs'
    ];

    const unusedTables = [
      'leaderboards', 'user_cosmetics', 'user_subscriptions', 'vip_tiers'
    ];

    Object.entries(tables).forEach(([table, count]) => {
      const status = count === 0 ? '📭' : '✅';
      const info = `${status} ${table.padEnd(30)} ${count} rows`;

      if (criticalTables.includes(table)) {
        console.log(info + ' [CRITICAL]');
        critical[table] = count;
      } else if (optionalTables.includes(table)) {
        console.log(info + ' [OPTIONAL]');
        optional[table] = count;
      } else {
        console.log(info + ' [UNUSED]');
        unused[table] = count;
      }
    });

    console.log('\n' + '═'.repeat(60));
    console.log('\n📋 SUMMARY:\n');
    console.log(`  Critical tables:  ${Object.keys(critical).length} tables`);
    console.log(`  Optional tables:  ${Object.keys(optional).length} tables`);
    console.log(`  Unused tables:    ${Object.keys(unused).length} tables`);

    // Check for empty critical tables
    const emptyCritical = Object.entries(critical).filter(([_, count]) => count === 0);
    if (emptyCritical.length > 0) {
      console.log(`\n⚠️  EMPTY CRITICAL TABLES (${emptyCritical.length}):`);
      emptyCritical.forEach(([table]) => {
        console.log(`    ❌ ${table}`);
      });
    }

    // Check for unused but populated tables
    const populatedUnused = Object.entries(unused).filter(([_, count]) => count > 0);
    if (populatedUnused.length > 0) {
      console.log(`\n⚠️  POPULATED BUT UNUSED TABLES (${populatedUnused.length}):`);
      populatedUnused.forEach(([table, count]) => {
        console.log(`    ⚠️  ${table} (${count} rows)`);
      });
    }

    // 2. Check which tables are imported in schema.ts
    console.log('\n' + '═'.repeat(60));
    console.log('\n📝 SCHEMA.TS COVERAGE:\n');
    
    const schemaFile = fs.readFileSync('/workspaces/eclip/src/lib/db/schema.ts', 'utf-8');
    const schemaTableExports = schemaFile.match(/export const (\w+) = pgTable\('/g) || [];
    const schemaTables = schemaTableExports.map(m => m.match(/export const (\w+)/)[1]);
    
    console.log(`  Tables defined in schema.ts: ${schemaTables.length}`);
    
    const tableNamesInDb = Object.keys(tables);
    const missingFromSchema = tableNamesInDb.filter(t => !schemaTables.includes(t));
    
    if (missingFromSchema.length > 0) {
      console.log(`\n  ⚠️  Missing from schema.ts (${missingFromSchema.length}):`);
      missingFromSchema.forEach(table => {
        const count = tables[table];
        console.log(`     ${table.padEnd(30)} (${count} rows)`);
      });
    }

    // 3. Key statistics
    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 DATA SUMMARY:\n');

    const stats = {
      'Total Users': (await pool.query(`SELECT COUNT(*) as cnt FROM users`)).rows[0].cnt,
      'Total Matches': (await pool.query(`SELECT COUNT(*) as cnt FROM matches`)).rows[0].cnt,
      'Total Cosmetics': (await pool.query(`SELECT COUNT(*) as cnt FROM cosmetics`)).rows[0].cnt,
      'User Inventory Items': (await pool.query(`SELECT COUNT(*) as cnt FROM user_inventory`)).rows[0].cnt,
      'Achievements': (await pool.query(`SELECT COUNT(*) as cnt FROM achievements`)).rows[0].cnt,
      'Missions': (await pool.query(`SELECT COUNT(*) as cnt FROM missions`)).rows[0].cnt,
    };

    Object.entries(stats).forEach(([key, val]) => {
      console.log(`  ${key.padEnd(30)} = ${val}`);
    });

    // 4. Check admin user
    console.log('\n' + '═'.repeat(60));
    console.log('\n👤 ADMIN USER:\n');
    
    const adminRes = await pool.query(`
      SELECT id, username, role, level, esr, is_vip FROM users 
      WHERE role = 'ADMIN' 
      LIMIT 1
    `);

    if (adminRes.rows.length > 0) {
      const admin = adminRes.rows[0];
      console.log(`  ✅ Username: ${admin.username}`);
      console.log(`  ✅ Level: ${admin.level}`);
      console.log(`  ✅ ESR: ${admin.esr}`);
      console.log(`  ✅ VIP: ${admin.is_vip}`);
    } else {
      console.log(`  ❌ No admin user found!`);
    }

    console.log('\n✅ Audit complete!\n');
    await pool.end();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

auditDatabase();
