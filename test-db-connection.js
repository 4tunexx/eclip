#!/usr/bin/env node

// Test script to debug the actual error
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING DAILY LOGIN SCRIPT ISSUE\n');

// 1. Check if .env.local exists
console.log('1️⃣  Checking .env.local...');
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('   ✅ .env.local exists');
  
  const content = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = content.split('\n');
  const dbUrl = lines.find(line => line.startsWith('DATABASE_URL'));
  if (dbUrl) {
    console.log('   ✅ DATABASE_URL found');
    const masked = dbUrl.substring(0, 30) + '...';
    console.log(`      ${masked}`);
  } else {
    console.log('   ❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }
} else {
  console.log('   ❌ .env.local not found');
  process.exit(1);
}

// 2. Check if pg module is installed
console.log('\n2️⃣  Checking pg module...');
try {
  const pg = require('pg');
  console.log('   ✅ pg module loaded');
  console.log('      Version:', pg.version || 'unknown');
} catch (err) {
  console.log('   ❌ pg module not found');
  console.log('      Error:', err.message);
  process.exit(1);
}

// 3. Parse env and test connection
console.log('\n3️⃣  Testing database connection...');
const env = {};
const lines = content.split('\n');
lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    env[key] = value;
  }
});

if (!env.DATABASE_URL) {
  console.log('   ❌ DATABASE_URL not parsed correctly');
  process.exit(1);
}

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('   ✅ Connected to database');
    
    // Test query
    const result = await client.query('SELECT 1 as test');
    console.log('   ✅ Test query successful');
    
    // Check if missions table exists
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'missions'
    `);
    
    if (tables.rows.length > 0) {
      console.log('   ✅ missions table exists');
      
      // Check columns
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'missions'
        ORDER BY ordinal_position
      `);
      
      console.log('   📋 missions table columns:');
      cols.rows.forEach(row => {
        console.log(`       - ${row.column_name}`);
      });
    } else {
      console.log('   ❌ missions table does NOT exist');
    }
    
    client.release();
    console.log('\n✅ All checks passed! Database is ready.');
    console.log('\nNow try running:');
    console.log('   node apply-daily-login.js');
    
    process.exit(0);
  } catch (error) {
    console.error('   ❌ Database connection failed:');
    console.error('      ', error.message);
    console.error('\n   Possible causes:');
    console.error('   - Wrong DATABASE_URL');
    console.error('   - Network connectivity issue');
    console.error('   - Database is down');
    console.error('   - SSL certificate issue (pooler might require sslmode)');
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
