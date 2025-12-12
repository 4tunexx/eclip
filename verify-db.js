#!/usr/bin/env node

/**
 * Database Verification Script - Uses Node.js with postgres driver
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Set env vars
Object.assign(process.env, envVars);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local!');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded from .env.local');
console.log('🔍 Connecting to Neon database...\n');

const postgres = require('postgres');

async function checkDatabase() {
  try {
    const sql = postgres(DATABASE_URL, { 
      max: 1,
      idle_timeout: 5,
      max_lifetime: 60
    });

    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Successfully connected to Neon database!\n');

    // 1. Count users and check for NULL values
    console.log('📊 CHECKING USER DATA INTEGRITY:');
    console.log('═'.repeat(70));
    
    const stats = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN level IS NULL THEN 1 END) as null_levels,
        COUNT(CASE WHEN xp IS NULL THEN 1 END) as null_xps,
        COUNT(CASE WHEN esr IS NULL THEN 1 END) as null_esrs,
        COUNT(CASE WHEN rank IS NULL THEN 1 END) as null_ranks,
        COUNT(CASE WHEN avatar IS NULL THEN 1 END) as null_avatars,
        COUNT(CASE WHEN email_verified IS NULL THEN 1 END) as null_email_verified
      FROM "users"
    `;

    const stat = stats[0];
    console.log(`Total Users: ${stat.total_users}`);
    console.log(`NULL Levels: ${stat.null_levels}`);
    console.log(`NULL XP: ${stat.null_xps}`);
    console.log(`NULL ESR: ${stat.null_esrs}`);
    console.log(`NULL Rank: ${stat.null_ranks}`);
    console.log(`NULL Avatars: ${stat.null_avatars}`);
    console.log(`NULL Email Verified: ${stat.null_email_verified}`);

    // 2. Show first 10 users
    console.log('\n📋 FIRST 10 USERS IN DATABASE:');
    console.log('═'.repeat(70));
    
    const users = await sql`
      SELECT 
        id, 
        username, 
        email,
        level, 
        xp, 
        esr, 
        rank,
        role,
        email_verified,
        created_at
      FROM "users"
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
    } else {
      console.log(`Found ${users.length} users:\n`);
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.username} (ID: ${user.id})`);
        console.log(`   Email: ${user.email} | Verified: ${user.email_verified}`);
        console.log(`   Level: ${user.level} | XP: ${user.xp} | ESR: ${user.esr} | Rank: ${user.rank}`);
        console.log(`   Role: ${user.role} | Created: ${user.created_at}`);
        console.log('');
      });
    }

    // 3. Check ESR thresholds
    console.log('\n🎯 ESR TIER DEFINITIONS:');
    console.log('═'.repeat(70));
    
    const tiers = await sql`
      SELECT tier, division, min_esr, max_esr
      FROM "esr_thresholds"
      ORDER BY min_esr ASC
    `;

    if (tiers.length === 0) {
      console.log('⚠️  No ESR thresholds defined!');
    } else {
      console.log('Tier | Division | Min ESR | Max ESR');
      console.log('─'.repeat(70));
      tiers.forEach(t => {
        console.log(`${t.tier.padEnd(15)} | ${String(t.division).padEnd(8)} | ${String(t.min_esr).padEnd(7)} | ${t.max_esr}`);
      });
    }

    // 4. Check user profiles and cosmetics
    console.log('\n✨ CHECKING USER COSMETICS:');
    console.log('═'.repeat(70));
    
    const profiles = await sql`
      SELECT 
        user_id,
        frame_id,
        banner_id,
        title_id,
        badge_id
      FROM "user_profiles"
      WHERE frame_id IS NOT NULL OR banner_id IS NOT NULL OR title_id IS NOT NULL OR badge_id IS NOT NULL
      LIMIT 5
    `;

    if (profiles.length === 0) {
      console.log('⚠️  No equipped cosmetics found!');
    } else {
      console.log(`Found ${profiles.length} users with equipped cosmetics:\n`);
      profiles.forEach((p, i) => {
        console.log(`${i + 1}. User ID: ${p.user_id}`);
        console.log(`   Frame: ${p.frame_id} | Banner: ${p.banner_id} | Title: ${p.title_id} | Badge: ${p.badge_id}`);
      });
    }

    await sql.end();
    console.log('\n✅ Database verification complete!');
    
  } catch (error) {
    console.error('\n❌ Database error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   → Cannot connect to Neon database. Check DATABASE_URL');
    }
    process.exit(1);
  }
}

checkDatabase();
