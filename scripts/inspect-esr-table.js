#!/usr/bin/env node

const { Pool } = require('pg');

async function inspectTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Get table structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'esr_thresholds'
      ORDER BY ordinal_position
    `);

    console.log('ESR Thresholds table structure:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

    // Get sample data
    console.log('\nSample data:');
    const data = await pool.query('SELECT * FROM esr_thresholds LIMIT 3');
    console.log(JSON.stringify(data.rows, null, 2));

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

inspectTable();
