#!/usr/bin/env node

/**
 * VERIFY ACTUAL USER DATA IN NEON DATABASE
 * Inspects real user records and compares with what API returns
 */

import dotenv from 'dotenv';
import postgres from 'postgres';

// Load .env.local explicitly
dotenv.config({ path: '/workspaces/eclip/.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  console.error('Available env vars with DB:', Object.keys(process.env).filter(k => k.toUpperCase().includes('DB')));
  process.exit(1);
}

async function verifyUserData() {
  const sql = postgres(DATABASE_URL as string, { max: 1 });

  try {
    console.log('\n🔍 VERIFYING USER DATA IN NEON DATABASE');
    console.log('════════════════════════════════════════════════════════════════\n');

    // 1. Get all users with their stats
    const users = await sql`
      SELECT 
        id, username, email, level, xp, esr, rank, avatar, 
        "rankTier", "rankDivision", coins, role, "steamId",
        "emailVerified", "createdAt"
      FROM "public"."users"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;

    console.log(`📊 Found ${users.length} users in database:\n`);
    console.log('─'.repeat(120));
    console.log('USERNAME'.padEnd(20) + 'LEVEL'.padEnd(8) + 'XP'.padEnd(10) + 'ESR'.padEnd(8) + 'RANK'.padEnd(15) + 'AVATAR'.padEnd(30) + 'STEAM_ID'.padEnd(20) + 'ROLE');
    console.log('─'.repeat(120));

    for (const user of users) {
      const level = (user as any).level || 1;
      const xp = (user as any).xp || 0;
      const esr = (user as any).esr || 1000;
      const rank = (user as any).rank || 'Unknown';
      const avatar = ((user as any).avatar || 'NONE').substring(0, 28);
      const steamId = ((user as any).steamId || 'NONE').substring(0, 18);
      const role = (user as any).role || 'USER';

      console.log(
        (user as any).username.padEnd(20) +
        level.toString().padEnd(8) +
        xp.toString().padEnd(10) +
        esr.toString().padEnd(8) +
        rank.padEnd(15) +
        avatar.padEnd(30) +
        steamId.padEnd(20) +
        role
      );
    }

    console.log('\n' + '─'.repeat(120));

    // 2. Check for missing or NULL values
    console.log('\n🚨 CHECKING FOR DATA INTEGRITY ISSUES:\n');

    const nullCheck = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN level IS NULL THEN 1 END) as null_level,
        COUNT(CASE WHEN xp IS NULL THEN 1 END) as null_xp,
        COUNT(CASE WHEN esr IS NULL THEN 1 END) as null_esr,
        COUNT(CASE WHEN rank IS NULL THEN 1 END) as null_rank,
        COUNT(CASE WHEN avatar IS NULL THEN 1 END) as null_avatar,
        COUNT(CASE WHEN "rankTier" IS NULL THEN 1 END) as null_rankTier,
        COUNT(CASE WHEN "rankDivision" IS NULL THEN 1 END) as null_rankDivision
      FROM "public"."users"
    `;

    const check = nullCheck[0] as any;
    console.log(`Total Users: ${check.total}`);
    console.log(`  - NULL Level: ${check.null_level}`);
    console.log(`  - NULL XP: ${check.null_xp}`);
    console.log(`  - NULL ESR: ${check.null_esr}`);
    console.log(`  - NULL Rank: ${check.null_rank}`);
    console.log(`  - NULL Avatar: ${check.null_avatar}`);
    console.log(`  - NULL RankTier: ${check.null_rankTier}`);
    console.log(`  - NULL RankDivision: ${check.null_rankDivision}`);

    if (check.null_level > 0 || check.null_xp > 0 || check.null_esr > 0) {
      console.log('\n⚠️  WARNING: Some users have NULL stats!');
    } else {
      console.log('\n✅ All users have valid stat data');
    }

    // 3. Check user profiles table
    console.log('\n' + '═'.repeat(120));
    console.log('\n📋 CHECKING USER_PROFILES TABLE:\n');

    const profiles = await sql`
      SELECT 
        up.id, up."userId", u.username,
        up.title, up."equippedFrameId", up."equippedBannerId",
        up."equippedBadgeId", up.stats,
        up."createdAt", up."updatedAt"
      FROM "public"."user_profiles" up
      LEFT JOIN "public"."users" u ON up."userId" = u.id
      LIMIT 10
    `;

    console.log(`Found ${profiles.length} user profiles:\n`);
    for (const profile of profiles) {
      console.log(`User: ${(profile as any).username || 'N/A'}`);
      console.log(`  Title: ${(profile as any).title || 'NONE'}`);
      console.log(`  Equipped Frame: ${(profile as any).equippedFrameId || 'NONE'}`);
      console.log(`  Equipped Banner: ${(profile as any).equippedBannerId || 'NONE'}`);
      console.log(`  Stats: ${(profile as any).stats ? JSON.stringify((profile as any).stats).substring(0, 50) : 'NONE'}`);
      console.log('');
    }

    // 4. Check ESR thresholds
    console.log('═'.repeat(120));
    console.log('\n🎯 CHECKING ESR_THRESHOLDS TABLE:\n');

    const esrThresholds = await sql`
      SELECT 
        tier, division, "minEsr", "maxEsr", color
      FROM "public"."esr_thresholds"
      ORDER BY "minEsr" ASC
    `;

    console.log(`Found ${esrThresholds.length} ESR tier definitions:\n`);
    console.log('TIER'.padEnd(15) + 'DIVISION'.padEnd(10) + 'MIN_ESR'.padEnd(10) + 'MAX_ESR'.padEnd(10) + 'COLOR');
    console.log('─'.repeat(60));

    for (const threshold of esrThresholds) {
      console.log(
        ((threshold as any).tier || '?').padEnd(15) +
        ((threshold as any).division || '?').toString().padEnd(10) +
        ((threshold as any).minEsr || '?').toString().padEnd(10) +
        ((threshold as any).maxEsr || '?').toString().padEnd(10) +
        ((threshold as any).color || '?')
      );
    }

    // 5. Verify expected ranks exist
    console.log('\n' + '═'.repeat(120));
    console.log('\n✅ EXPECTED RANKS (from FAQ):\n');
    console.log('  Beginner (0-500 ESR) → Rookie (500-1000) → Pro (1000-2000) → Ace (2000-3500) → Legend (3500+ ESR)');
    console.log('  Each with divisions I, II, III\n');

    const expectedTiers = ['Beginner', 'Rookie', 'Pro', 'Ace', 'Legend'];
    for (const tier of expectedTiers) {
      const tierData = esrThresholds.filter((t: any) => t.tier === tier);
      if (tierData.length === 3) {
        console.log(`✅ ${tier}: Has all 3 divisions`);
      } else {
        console.log(`❌ ${tier}: Missing divisions (found ${tierData.length}/3)`);
      }
    }

    console.log('\n' + '═'.repeat(120));
    console.log('\n✅ VERIFICATION COMPLETE\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

verifyUserData();
