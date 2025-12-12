#!/usr/bin/env node
/**
 * FRESH DATABASE INSPECTION TOOL
 * Connects to Neon and shows complete database state
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         NEON DATABASE FRESH INSPECTION                  ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // 1. GET ALL TABLES
    const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tableRes.rows.map(r => r.table_name);
    console.log(`📊 FOUND ${tables.length} TABLES\n`);

    // 2. FOR EACH TABLE - GET COLUMNS AND ROW COUNT
    const tableDetails = [];
    for (const table of tables) {
      const colRes = await pool.query(`
        SELECT COUNT(*) as cnt FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      
      const rowRes = await pool.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
      
      tableDetails.push({
        name: table,
        cols: colRes.rows[0].cnt,
        rows: rowRes.rows[0].cnt
      });
    }

    // 3. PRINT TABLE SUMMARY
    tableDetails.forEach(t => {
      const status = t.rows > 0 ? '✅' : '📭';
      console.log(`${status} ${t.name.padEnd(30)} | Cols: ${t.cols.toString().padEnd(2)} | Rows: ${t.rows}`);
    });

    console.log('\n' + '═'.repeat(57));
    console.log('\n👥 USERS TABLE FULL DATA:\n');
    
    // 4. GET USERS WITH ALL COLUMNS
    const usersRes = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`);
    
    if (usersRes.rows.length === 0) {
      console.log('  (No users)');
    } else {
      const users = usersRes.rows;
      users.forEach((u, i) => {
        console.log(`\n  ${i+1}. USERNAME: ${u.username}`);
        console.log(`     ID: ${u.id}`);
        console.log(`     Level: ${u.level} | XP: ${u.xp} | ESR: ${u.esr}`);
        console.log(`     Rank: ${u.current_rank || 'N/A'} | Role: ${u.role}`);
        console.log(`     Verified: ${u.verified} | Created: ${u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : 'N/A'}`);
        if (u.role_color) console.log(`     Role Color: ${u.role_color}`);
        if (u.nickname) console.log(`     Nickname: ${u.nickname}`);
      });
    }

    console.log('\n' + '═'.repeat(57));
    console.log('\n⚔️  MATCHES:\n');
    
    // 5. GET MATCHES
    const matchesRes = await pool.query(`
      SELECT id, map, status, winner_team, started_at FROM matches 
      ORDER BY started_at DESC LIMIT 10
    `);
    
    if (matchesRes.rows.length === 0) {
      console.log('  (No matches)');
    } else {
      matchesRes.rows.forEach((m, i) => {
        console.log(`  ${i+1}. Map: ${(m.map || 'null').padEnd(15)} | Status: ${m.status.padEnd(10)} | Winner: ${m.winner_team || 'N/A'} | ${m.started_at ? new Date(m.started_at).toISOString().split('T')[0] : 'N/A'}`);
      });
    }

    console.log('\n' + '═'.repeat(57));
    console.log('\n🎁 COSMETICS BREAKDOWN:\n');
    
    // 6. GET COSMETICS
    const cosmRes = await pool.query(`
      SELECT type, rarity, COUNT(*) as cnt 
      FROM cosmetics 
      GROUP BY type, rarity 
      ORDER BY type, rarity
    `);
    
    if (cosmRes.rows.length === 0) {
      console.log('  (No cosmetics)');
    } else {
      let currentType = '';
      cosmRes.rows.forEach(c => {
        if (c.type !== currentType) {
          console.log(`\n  ${c.type}:`);
          currentType = c.type;
        }
        console.log(`    ${c.rarity.padEnd(12)} = ${c.cnt}`);
      });
    }

    console.log('\n' + '═'.repeat(57));
    console.log('\n📋 KEY STATISTICS:\n');
    
    const stats = {
      'Total Users': usersRes.rows.length,
      'Total Matches': tableDetails.find(t => t.name === 'matches').rows,
      'Total Cosmetics': tableDetails.find(t => t.name === 'cosmetics').rows,
      'Total Achievements': tableDetails.find(t => t.name === 'achievements').rows,
      'Total Missions': tableDetails.find(t => t.name === 'missions').rows,
      'Active Sessions': tableDetails.find(t => t.name === 'sessions').rows,
      'Notifications': tableDetails.find(t => t.name === 'notifications').rows
    };
    
    Object.entries(stats).forEach(([key, val]) => {
      console.log(`  ${key.padEnd(25)} = ${val}`);
    });

    console.log('\n✅ Database inspection complete!\n');
    await pool.end();
  } catch (error) {
    console.error('\n❌ DATABASE ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main().catch(console.error);
