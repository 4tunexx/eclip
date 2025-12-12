#!/usr/bin/env node

/**
 * Fix common database issues with login/register
 * Run this to diagnose and fix Neon database problems
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const DATABASE_URL = env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const postgres = require('pg');
const { Pool } = postgres;

const pool = new Pool({ connectionString: DATABASE_URL });

(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to Neon database\n');

    console.log('🔍 DIAGNOSING LOGIN/REGISTER ISSUES...\n');

    // Check 1: Users table exists
    console.log('1️⃣  Checking users table structure...');
    const tableCheck = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Users table does not exist!');
      process.exit(1);
    }

    console.log('✅ Users table exists with columns:');
    tableCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    // Check 2: Sessions table exists
    console.log('\n2️⃣  Checking sessions table...');
    const sessionsCheck = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'sessions'
    `);
    
    if (sessionsCheck.rows[0].count === 1) {
      console.log('✅ Sessions table exists');
    } else {
      console.log('⚠️  Sessions table missing (auto-created on first login)');
    }

    // Check 3: Count users
    console.log('\n3️⃣  Checking existing users...');
    const usersCheck = await client.query(`
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
             COUNT(CASE WHEN email_verified = true THEN 1 END) as verified
      FROM users
    `);
    
    const stats = usersCheck.rows[0];
    console.log(`✅ Total users: ${stats.total}`);
    console.log(`✅ Admin users: ${stats.admins}`);
    console.log(`✅ Email verified: ${stats.verified}`);

    // Check 4: List users with issues
    console.log('\n4️⃣  Checking for users with issues...');
    const problematicUsers = await client.query(`
      SELECT id, email, username, role, email_verified, rank, esr
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (problematicUsers.rows.length === 0) {
      console.log('ℹ️  No users in database yet');
    } else {
      console.log('Recent users:');
      problematicUsers.rows.forEach((u, i) => {
        console.log(`\n${i + 1}. ${u.username} (${u.email})`);
        console.log(`   Role: ${u.role}`);
        console.log(`   Verified: ${u.email_verified ? 'Yes' : 'No'}`);
        console.log(`   Rank: ${u.rank} (ESR: ${u.esr})`);
      });
    }

    // Check 5: Check for stale sessions
    console.log('\n5️⃣  Checking for stale sessions...');
    const sessionCheck = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired
      FROM sessions
    `);
    
    const sessStats = sessionCheck.rows[0];
    console.log(`✅ Total sessions: ${sessStats.total}`);
    console.log(`⚠️  Expired sessions: ${sessStats.expired}`);

    if (sessStats.expired > 0) {
      console.log('\n   ⚠️  Cleaning up expired sessions...');
      const cleanup = await client.query(`DELETE FROM sessions WHERE expires_at < NOW()`);
      console.log(`   ✅ Deleted ${cleanup.rowCount} expired sessions`);
    }

    // Check 6: Verify email verification token table
    console.log('\n6️⃣  Checking email verification tokens...');
    const tokenCheck = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN email_verified = false THEN 1 END) as pending
      FROM users
      WHERE email_verification_token IS NOT NULL
    `);
    
    const tokenStats = tokenCheck.rows[0];
    console.log(`✅ Pending verifications: ${tokenStats.pending}`);

    console.log('\n' + '='.repeat(70));
    console.log('🎯 FIXES YOU CAN APPLY:\n');

    if (stats.admins === 0 && stats.total > 0) {
      console.log('❌ NO ADMIN USER FOUND!');
      console.log('\nTo make a user admin, run:\n');
      console.log('```sql');
      console.log("UPDATE users SET role = 'ADMIN' WHERE email = 'your_email@example.com';");
      console.log('```\n');
    }

    if (sessStats.expired > 0) {
      console.log('⚠️  EXPIRED SESSIONS CLEANED ✅\n');
    }

    console.log('If login/register is still broken, check:');
    console.log('  1. DATABASE_URL is correct in .env.local');
    console.log('  2. Your email is verified (email_verified = true)');
    console.log('  3. No duplicate emails or usernames');
    console.log('  4. Sessions are being cleared on login\n');

    console.log('📝 To manually fix issues, use these SQL commands:\n');
    
    console.log('-- Make a user admin:');
    console.log("UPDATE users SET role = 'ADMIN' WHERE email = 'your_email';");
    console.log('');
    
    console.log('-- Mark email as verified:');
    console.log("UPDATE users SET email_verified = true WHERE email = 'your_email';");
    console.log('');
    
    console.log('-- Clear all sessions (emergency):');
    console.log('DELETE FROM sessions;');
    console.log('');
    
    console.log('-- Check user data:');
    console.log("SELECT * FROM users WHERE email = 'your_email';");
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Cannot connect to Neon database!');
      console.error('   Check: DATABASE_URL in .env.local');
    }
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
