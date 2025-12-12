#!/usr/bin/env node

/**
 * COMPREHENSIVE DATABASE INSPECTION
 * Inspects actual database vs codebase expectations
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

Object.assign(process.env, envVars);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

const postgres = require('postgres');

// ESR tiers from code
const EXPECTED_TIERS = {
  Beginner: { ranges: [[0, 166], [167, 333], [334, 500]] },
  Rookie: { ranges: [[500, 666], [667, 833], [834, 1000]] },
  Pro: { ranges: [[1000, 1333], [1334, 1666], [1667, 2000]] },
  Ace: { ranges: [[2000, 2500], [2501, 3000], [3001, 3500]] },
  Legend: { ranges: [[3500, 4000], [4001, 4500], [4501, 5000]] },
};

async function inspectDatabase() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║        FULL DATABASE INSPECTION - ECLIP GAME DATABASE          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // 1. USERS TABLE STRUCTURE
    console.log('1️⃣ USERS TABLE STRUCTURE');
    console.log('═'.repeat(70));
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.log(`Found ${columns.length} columns:\n`);
    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✓ nullable' : '✗ NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default}` : '';
      console.log(`  • ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} [${nullable}]${defaultVal}`);
    });

    // 2. USERS DATA ANALYSIS
    console.log('\n2️⃣ USERS TABLE DATA ANALYSIS');
    console.log('═'.repeat(70));
    
    const userStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT role) as unique_roles,
        MIN(level) as min_level,
        MAX(level) as max_level,
        AVG(level)::INT as avg_level,
        MIN(xp) as min_xp,
        MAX(xp) as max_xp,
        MIN(esr) as min_esr,
        MAX(esr) as max_esr,
        AVG(esr)::INT as avg_esr,
        COUNT(DISTINCT rank) as unique_rank_values,
        COUNT(DISTINCT COALESCE(avatar, 'NULL')) as avatar_variants
      FROM "users"
    `;
    
    const stat = userStats[0];
    console.log(`Total Users: ${stat.total}`);
    console.log(`Level Range: ${stat.min_level} - ${stat.max_level} (avg: ${stat.avg_level})`);
    console.log(`XP Range: ${stat.min_xp} - ${stat.max_xp}`);
    console.log(`ESR Range: ${stat.min_esr} - ${stat.max_esr} (avg: ${stat.avg_esr})`);
    console.log(`Unique Rank Values: ${stat.unique_rank_values}`);
    console.log(`Unique Roles: ${stat.unique_roles}`);
    console.log(`Avatar Variants: ${stat.avatar_variants}`);

    // 3. RANK VALUES IN DATABASE
    console.log('\n3️⃣ RANK VALUES IN DATABASE');
    console.log('═'.repeat(70));
    const rankDistribution = await sql`
      SELECT rank, COUNT(*) as count
      FROM "users"
      GROUP BY rank
      ORDER BY count DESC
    `;
    
    rankDistribution.forEach(r => {
      console.log(`  "${r.rank}": ${r.count} users`);
    });

    // 4. EXPECTED vs ACTUAL RANK TIERS
    console.log('\n4️⃣ RANK CALCULATION CHECK');
    console.log('═'.repeat(70));
    console.log('Expected tiers from code:');
    Object.entries(EXPECTED_TIERS).forEach(([tier, data]) => {
      const ranges = data.ranges.map(r => `[${r[0]}-${r[1]}]`).join(', ');
      console.log(`  • ${tier}: ${ranges}`);
    });

    // 5. ESR vs RANK MISMATCHES
    console.log('\n5️⃣ ESR vs RANK MISMATCH ANALYSIS');
    console.log('═'.repeat(70));
    
    const users = await sql`
      SELECT id, username, esr, rank
      FROM "users"
      ORDER BY esr DESC
    `;

    function getExpectedRank(esr) {
      for (const [tierName, tierData] of Object.entries(EXPECTED_TIERS)) {
        for (const [min, max] of tierData.ranges) {
          if (esr >= min && esr <= max) {
            return tierName;
          }
        }
      }
      return 'Legend';
    }

    let mismatches = 0;
    users.forEach(user => {
      const expectedRank = getExpectedRank(user.esr);
      if (user.rank !== expectedRank) {
        mismatches++;
        if (mismatches <= 10) {
          console.log(`  ⚠️  ${user.username.padEnd(20)} ESR: ${String(user.esr).padEnd(4)} DB: "${user.rank}" → Expected: "${expectedRank}"`);
        }
      }
    });
    console.log(`\n❌ Total Rank Mismatches: ${mismatches}/${users.length}`);

    // 6. NULL VALUES CHECK
    console.log('\n6️⃣ NULL/MISSING VALUES CHECK');
    console.log('═'.repeat(70));
    
    const nullCheck = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE id IS NULL) as null_id,
        COUNT(*) FILTER (WHERE username IS NULL) as null_username,
        COUNT(*) FILTER (WHERE email IS NULL) as null_email,
        COUNT(*) FILTER (WHERE level IS NULL) as null_level,
        COUNT(*) FILTER (WHERE xp IS NULL) as null_xp,
        COUNT(*) FILTER (WHERE esr IS NULL) as null_esr,
        COUNT(*) FILTER (WHERE rank IS NULL) as null_rank,
        COUNT(*) FILTER (WHERE avatar IS NULL) as null_avatar,
        COUNT(*) FILTER (WHERE email_verified IS FALSE) as unverified_emails,
        COUNT(*) as total
      FROM "users"
    `;
    
    const nulls = nullCheck[0];
    console.log(`ID: ${nulls.null_id} NULL`);
    console.log(`Username: ${nulls.null_username} NULL`);
    console.log(`Email: ${nulls.null_email} NULL`);
    console.log(`Level: ${nulls.null_level} NULL (Expected: 0)`);
    console.log(`XP: ${nulls.null_xp} NULL (Expected: 0)`);
    console.log(`ESR: ${nulls.null_esr} NULL (Expected: 0)`);
    console.log(`Rank: ${nulls.null_rank} NULL`);
    console.log(`Avatar: ${nulls.null_avatar} NULL (${Math.round(nulls.null_avatar/nulls.total*100)}% of users)`);
    console.log(`Unverified Emails: ${nulls.unverified_emails}`);

    // 7. USER PROFILES TABLE
    console.log('\n7️⃣ USER_PROFILES TABLE');
    console.log('═'.repeat(70));
    
    const profileStats = await sql`
      SELECT 
        COUNT(*) as total_profiles,
        COUNT(DISTINCT user_id) as users_with_profile,
        COUNT(*) FILTER (WHERE equipped_frame_id IS NOT NULL) as with_frame,
        COUNT(*) FILTER (WHERE equipped_banner_id IS NOT NULL) as with_banner,
        COUNT(*) FILTER (WHERE equipped_badge_id IS NOT NULL) as with_badge,
        COUNT(*) FILTER (WHERE title IS NOT NULL) as with_title
      FROM "user_profiles"
    `;
    
    const profiles = profileStats[0];
    console.log(`Total Profiles: ${profiles.total_profiles}`);
    console.log(`Users with Profile: ${profiles.users_with_profile}/${nulls.total}`);
    console.log(`  • With Frame: ${profiles.with_frame}`);
    console.log(`  • With Banner: ${profiles.with_banner}`);
    console.log(`  • With Badge: ${profiles.with_badge}`);
    console.log(`  • With Title: ${profiles.with_title}`);

    // 8. COSMETICS TABLE
    console.log('\n8️⃣ COSMETICS TABLE');
    console.log('═'.repeat(70));
    
    const cosmeticStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT type) as types,
        COUNT(DISTINCT rarity) as rarities
      FROM "cosmetics"
    `;
    
    const cosmetics = cosmeticStats[0];
    console.log(`Total Cosmetics: ${cosmetics.total}`);
    console.log(`Types: ${cosmetics.types}`);
    console.log(`Rarities: ${cosmetics.rarities}`);
    
    const cosmeticsByType = await sql`
      SELECT type, rarity, COUNT(*) as count
      FROM "cosmetics"
      GROUP BY type, rarity
      ORDER BY type, rarity
    `;
    
    console.log('\nCosmetics by Type & Rarity:');
    cosmeticsByType.forEach(c => {
      console.log(`  • ${c.type.padEnd(15)} ${c.rarity.padEnd(10)} = ${c.count}`);
    });

    // 9. ESR_THRESHOLDS TABLE
    console.log('\n9️⃣ ESR_THRESHOLDS TABLE');
    console.log('═'.repeat(70));
    
    const thresholds = await sql`
      SELECT tier, division, min_esr, max_esr
      FROM "esr_thresholds"
      ORDER BY min_esr ASC
    `;
    
    if (thresholds.length === 0) {
      console.log('⚠️  NO ESR THRESHOLDS DEFINED IN DATABASE!');
    } else {
      console.log(`Found ${thresholds.length} tier definitions:\n`);
      console.log('TIER        | DIV | MIN ESR | MAX ESR');
      console.log('─'.repeat(50));
      thresholds.forEach(t => {
        console.log(`${t.tier.padEnd(11)} | ${String(t.division).padEnd(3)} | ${String(t.min_esr).padEnd(6)} | ${t.max_esr}`);
      });
    }

    // 10. SAMPLE USERS
    console.log('\n🔟 SAMPLE USERS (First 5)');
    console.log('═'.repeat(70));
    
    const sampleUsers = await sql`
      SELECT 
        id, username, email, level, xp, esr, rank, avatar, role, email_verified, created_at
      FROM "users"
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    sampleUsers.forEach((user, i) => {
      console.log(`\n${i + 1}. ${user.username} (${user.role})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'NULL'} (Verified: ${user.email_verified})`);
      console.log(`   Stats: L${user.level} | XP: ${user.xp} | ESR: ${user.esr}`);
      console.log(`   Rank (DB): "${user.rank}" | Avatar: ${user.avatar ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    });

    // 11. SUMMARY
    console.log('\n📋 SUMMARY & ISSUES');
    console.log('═'.repeat(70));
    
    const issues = [];
    
    if (nulls.null_level > 0 || nulls.null_xp > 0 || nulls.null_esr > 0) {
      issues.push(`❌ Users with NULL level/xp/esr: ${nulls.null_level + nulls.null_xp + nulls.null_esr}`);
    }
    if (nulls.null_avatar > 0) {
      issues.push(`⚠️  Users without avatars: ${nulls.null_avatar}/${nulls.total} (${Math.round(nulls.null_avatar/nulls.total*100)}%)`);
    }
    if (mismatches > 0) {
      issues.push(`❌ Users with rank mismatches: ${mismatches}/${users.length}`);
    }
    if (thresholds.length === 0) {
      issues.push(`❌ No ESR thresholds defined in database!`);
    }
    if (nulls.unverified_emails > 0) {
      issues.push(`⚠️  Unverified emails: ${nulls.unverified_emails}`);
    }
    
    if (issues.length === 0) {
      console.log('✅ NO CRITICAL ISSUES FOUND!');
      console.log('Database is consistent with codebase expectations.');
    } else {
      console.log('Issues found:\n');
      issues.forEach(issue => console.log(`  ${issue}`));
    }

    console.log('\n✅ Database inspection complete!');
    
    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Database error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

inspectDatabase();
