#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  try {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   NEON DATABASE - ALL TABLES               ║');
    console.log('╚════════════════════════════════════════════╝\n');

    for (const { table_name } of tables.rows) {
      const count = await pool.query(`SELECT COUNT(*) as cnt FROM "${table_name}"`);
      const cols = await pool.query(`
        SELECT COUNT(*) as cnt FROM information_schema.columns 
        WHERE table_name = $1`, [table_name]);
      console.log(`✅ ${table_name.padEnd(30)} | Cols: ${cols.rows[0].cnt.toString().padEnd(2)} | Rows: ${count.rows[0].cnt}`);
    }

    console.log('\n' + '═'.repeat(45));
    console.log('\n👥 USERS TABLE:\n');
    const users = await pool.query(`SELECT id, username, level, esr, role, verified FROM users ORDER BY id`);
    if (users.rows.length === 0) {
      console.log('  (No users)\n');
    } else {
      users.rows.forEach((u, i) => {
        console.log(`  ${i+1}. ${u.username.padEnd(20)} | L${u.level} | ESR:${u.esr} | ${u.role} | Verified:${u.verified}`);
      });
    }

    console.log('\n⚔️  MATCHES (5 latest):\n');
    const matches = await pool.query(`
      SELECT id, map_name, status, winner_team, created_at 
      FROM matches ORDER BY created_at DESC LIMIT 5
    `);
    if (matches.rows.length === 0) {
      console.log('  (No matches)\n');
    } else {
      matches.rows.forEach((m, i) => {
        console.log(`  ${i+1}. ${(m.map_name || 'null').padEnd(15)} | ${m.status.padEnd(10)} | Winner:${m.winner_team}`);
      });
    }

    console.log('\n🎁 COSMETICS BY RARITY:\n');
    const cosm = await pool.query(`
      SELECT rarity, COUNT(*) as cnt FROM cosmetics 
      GROUP BY rarity ORDER BY rarity
    `);
    cosm.rows.forEach(c => {
      console.log(`  ${c.rarity.padEnd(12)} = ${c.cnt}`);
    });

    console.log('\n✅ Done!\n');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspect();
