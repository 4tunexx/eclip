#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\nUSERS TABLE COLUMNS:\n');
    res.rows.forEach((col, i) => {
      console.log(`${i+1}. ${col.column_name.padEnd(30)} | ${col.data_type}`);
    });
    
    console.log('\n\nSAMPLE DATA:\n');
    const dataRes = await pool.query(`SELECT * FROM users LIMIT 1`);
    if (dataRes.rows.length > 0) {
      const user = dataRes.rows[0];
      console.log(JSON.stringify(user, null, 2));
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
