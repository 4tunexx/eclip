#!/usr/bin/env node

/**
 * ECLIP SCHEMA INSPECTOR
 * Check actual database schema in Neon
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspectSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\n🔍 ECLIP DATABASE SCHEMA INSPECTOR\n');

    // Get all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📊 TABLES:');
    tables.rows.forEach(t => console.log(`  • ${t.table_name}`));

    // Get users table schema
    console.log('\n👥 USERS TABLE COLUMNS:');
    const usersCols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    usersCols.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      console.log(`  • ${col.column_name}: ${col.data_type} ${nullable}`);
    });

    // Sample user data
    console.log('\n📋 SAMPLE USER DATA:');
    const sample = await client.query(`SELECT * FROM users LIMIT 1`);
    if (sample.rows.length > 0) {
      const user = sample.rows[0];
      console.log(JSON.stringify(user, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

inspectSchema();
