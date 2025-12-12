#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspectDatabase() {
  try {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   NEON DATABASE INSPECTION                  ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Get all tables
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tableResult = await pool.query(tableQuery);
    const tables = tableResult.rows.map(row => row.table_name);
    
    console.log(`📊 FOUND ${tables.length} TABLES:\n`);
    
    // Get details for each table
    for (const tableName of tables) {
      const rowCount = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const colQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `;
      const colResult = await pool.query(colQuery, [tableName]);
      const cols = colResult.rows;
      
      console.log(`✅ ${tableName.padEnd(30)} | Cols: ${cols.length.toString().padEnd(2)} | Rows: ${rowCount.rows[0].count}`);
    }
    
    console.log('\n════════════════════════════════════════════\n');
    
    // Check USERS table details
    console.log('👥 USERS TABLE SCHEMA:\n');
    const usersSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    usersSchema.rows.forEach((col, i) => {
      console.log(`  ${i+1}. ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | Null: ${col.is_nullable} | Default: ${col.column_default || 'none'}`);
    });
    
    // Get all users
    console.log('\n👤 ALL USERS DATA:\n');
    const usersData = await pool.query('SELECT * FROM users ORDER BY id;');
    
    if (usersData.rows.length === 0) {
      console.log('  (No users)');
    } else {
      usersData.rows.forEach((user, i) => {
        console.log(`  ${i+1}. ID:${user.id} | ${user.username.padEnd(20)} | Level:${user.level} | ESR:${user.esr} | Role:${user.role} | Verified:${user.verified}`);
      });
    }
    
    // Check COSMETICS
    console.log('\n🎁 COSMETICS TABLE COUNTS BY RARITY:\n');
    const cosmetics = await pool.query(`
      SELECT rarity, type, COUNT(*) as count 
      FROM cosmetics 
      GROUP BY rarity, type 
      ORDER BY type, rarity;
    `);
    
    if (cosmetics.rows.length === 0) {
      console.log('  (No cosmetics)');
    } else {
      cosmetics.rows.forEach(row => {
        console.log(`  ${row.type.padEnd(15)} | ${row.rarity.padEnd(10)} = ${row.count}`);
      });
    }
    
    // Check MATCHES
    console.log('\n⚔️  MATCHES TABLE:\n');
    const matches = await pool.query(`
      SELECT id, map_name, status, winner_team, created_at
      FROM matches
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    if (matches.rows.length === 0) {
      console.log('  (No matches)');
    } else {
      matches.rows.forEach((match, i) => {
        console.log(`  ${i+1}. ID:${match.id} | Map:${match.map_name || 'null'} | Status:${match.status} | Winner:${match.winner_team} | ${match.created_at.toISOString().split('T')[0]}`);
      });
    }
    
    console.log('\n✅ Database inspection complete!\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    process.exit(1);
  }
}

inspectDatabase();
