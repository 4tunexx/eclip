#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

const REQUIRED_TABLES = [
  'users',
  'sessions',
  'user_profiles',
  'cosmetics',
  'user_inventory',
  'matches',
  'match_players',
  'queue_tickets',
  'missions',
  'user_mission_progress',
  'badges',
  'achievements',
  'user_achievements',
  'forum_categories',
  'forum_threads',
  'forum_posts',
  'ac_events',
  'bans',
  'notifications',
  'site_config',
  'transactions',
  'achievement_progress',
  'role_permissions',
  'esr_thresholds',
  'level_thresholds',
  'user_metrics',
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    console.log('\n📋 NEON DATABASE VALIDATION\n');
    console.log('═'.repeat(70));
    
    // Get all public tables
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const tableNames = new Set(allTables.map(t => t.table_name));
    
    console.log(`\n✅ Total tables in database: ${allTables.length}`);
    console.log(`📋 Required tables: ${REQUIRED_TABLES.length}\n`);
    
    let missing = [];
    let found = [];
    
    for (const table of REQUIRED_TABLES) {
      if (tableNames.has(table)) {
        const count = await sql`SELECT COUNT(*)::int as cnt FROM ${sql(table)}`;
        const rowCount = count[0].cnt;
        console.log(`✅ ${table.padEnd(30)} (${rowCount} rows)`);
        found.push(table);
      } else {
        console.log(`❌ ${table.padEnd(30)} MISSING`);
        missing.push(table);
      }
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ Found: ${found.length}/${REQUIRED_TABLES.length}`);
    console.log(`   ❌ Missing: ${missing.length}/${REQUIRED_TABLES.length}`);
    
    if (missing.length > 0) {
      console.log(`\n⚠️  MISSING TABLES:`);
      missing.forEach(t => console.log(`   - ${t}`));
      console.log('\n💡 These tables need to be created!');
    } else {
      console.log('\n🎉 ALL REQUIRED TABLES PRESENT!');
    }
    
    // Show unexpected tables
    const unexpected = Array.from(tableNames).filter(t => !REQUIRED_TABLES.includes(t));
    if (unexpected.length > 0) {
      console.log(`\n⚠️  UNEXPECTED TABLES (${unexpected.length}):`);
      unexpected.forEach(t => console.log(`   - ${t}`));
    }
    
    console.log('\n' + '═'.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
