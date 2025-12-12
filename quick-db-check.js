#!/usr/bin/env node

/**
 * QUICK DATABASE CHECK - Uses node directly, no TS compilation needed
 */

// Load .env.local
require('dotenv').config({ path: '/workspaces/eclip/.env.local' });

const postgres = require('postgres');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  console.error('env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')));
  process.exit(1);
}

console.log('✅ DATABASE_URL found');
console.log('URL preview:', DATABASE_URL.substring(0, 50) + '...');

async function check() {
  try {
    const sql = postgres(DATABASE_URL, { max: 1 });
    
    console.log('\n🔍 Querying users table...\n');
    
    // Get users
    const users = await sql`
      SELECT id, username, level, xp, esr, rank FROM "public"."users" LIMIT 10
    `;
    
    console.log('📊 USER DATA FROM DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (users.length === 0) {
      console.log('⚠️ No users found in database!');
    } else {
      console.table(users);
      console.log(`\n✅ Found ${users.length} users`);
    }
    
    // Check for NULL values
    console.log('\n🚨 CHECKING FOR NULL/MISSING VALUES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const nullCheck = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE level IS NULL) as null_level,
        COUNT(*) FILTER (WHERE xp IS NULL) as null_xp,
        COUNT(*) FILTER (WHERE esr IS NULL) as null_esr,
        COUNT(*) FILTER (WHERE rank IS NULL) as null_rank,
        COUNT(*) FILTER (WHERE avatar IS NULL) as null_avatar,
        COUNT(*) as total_users
      FROM "public"."users"
    `;
    
    console.table(nullCheck[0]);
    
    await sql.end();
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('\n❌ Database error:', error.message);
    process.exit(1);
  }
}

check();
