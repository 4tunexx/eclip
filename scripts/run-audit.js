#!/usr/bin/env node

/**
 * ECLIP DATABASE AUDIT SCRIPT
 * Connects to Neon and runs comprehensive health checks
 * Usage: node scripts/run-audit.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runAudit() {
  try {
    console.log('🔍 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // 1. Quick Health Check
    console.log('═══════════════════════════════════════════════════════════');
    console.log('1️⃣  QUICK HEALTH CHECK');
    console.log('═══════════════════════════════════════════════════════════');
    
    const healthCheck = await client.query(`
      SELECT 'Users' as metric, COUNT(*) as value FROM users
      UNION ALL
      SELECT 'Admins', COUNT(*) FROM users WHERE role = 'ADMIN'
      UNION ALL
      SELECT 'Email Verified', COUNT(*) FROM users WHERE "email_verified" = true
      UNION ALL
      SELECT 'Active Sessions', COUNT(*) FROM sessions WHERE "expires_at" >= NOW()
      UNION ALL
      SELECT 'Expired Sessions', COUNT(*) FROM sessions WHERE "expires_at" < NOW()
      UNION ALL
      SELECT 'Matches', COUNT(*) FROM matches
      UNION ALL
      SELECT 'Forum Threads', COUNT(*) FROM forum_threads
      UNION ALL
      SELECT 'Forum Categories', COUNT(*) FROM forum_categories
      UNION ALL
      SELECT 'Cosmetics', COUNT(*) FROM cosmetics
      UNION ALL
      SELECT 'User Profiles', COUNT(*) FROM user_profiles
    `);
    
    healthCheck.rows.forEach(row => {
      console.log(`  ${row.metric.padEnd(20)} : ${row.value}`);
    });

    // 2. Admin Check
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('2️⃣  ADMIN USERS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const admins = await client.query(`
      SELECT username, email, role, "email_verified", "created_at" 
      FROM users 
      WHERE role = 'ADMIN' 
      ORDER BY "created_at" DESC
    `);
    
    if (admins.rows.length === 0) {
      console.log('  ❌ NO ADMIN USERS FOUND! Create one immediately.');
    } else {
      admins.rows.forEach(admin => {
        console.log(`  ✅ ${admin.username} (${admin.email}) - ${admin.role}`);
      });
    }

    // 3. Data Quality
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('3️⃣  DATA QUALITY CHECK');
    console.log('═══════════════════════════════════════════════════════════');
    
    const noEmail = await client.query(`SELECT COUNT(*) as count FROM users WHERE email IS NULL OR email = ''`);
    const noUsername = await client.query(`SELECT COUNT(*) as count FROM users WHERE username IS NULL OR username = ''`);
    const tempSteamId = await client.query(`SELECT COUNT(*) as count FROM users WHERE "steamId" LIKE 'temp-%' OR "steamId" = ''`);
    
    console.log(`  Users with no email      : ${noEmail.rows[0].count} ${noEmail.rows[0].count > 0 ? '❌' : '✅'}`);
    console.log(`  Users with no username   : ${noUsername.rows[0].count} ${noUsername.rows[0].count > 0 ? '❌' : '✅'}`);
    console.log(`  Users with temp Steam ID : ${tempSteamId.rows[0].count} ${tempSteamId.rows[0].count > 0 ? '⚠️' : '✅'}`);

    // 4. Session Health
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('4️⃣  SESSION HEALTH');
    console.log('═══════════════════════════════════════════════════════════');
    
    const expiredSessions = await client.query(`SELECT COUNT(*) as count FROM sessions WHERE "expires_at" < NOW()`);
    const orphanedSessions = await client.query(`
      SELECT COUNT(*) as count FROM sessions s
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = s."userId")
    `);
    
    console.log(`  Expired sessions  : ${expiredSessions.rows[0].count}`);
    console.log(`  Orphaned sessions : ${orphanedSessions.rows[0].count} ${orphanedSessions.rows[0].count > 0 ? '⚠️ NEEDS CLEANUP' : '✅'}`);

    // 5. User Profiles
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('5️⃣  USER PROFILES');
    console.log('═══════════════════════════════════════════════════════════');
    
    const usersNoProfile = await client.query(`
      SELECT COUNT(*) as count FROM users u
      WHERE NOT EXISTS (SELECT 1 FROM "user_profiles" p WHERE p."userId" = u.id)
    `);
    
    console.log(`  Users without profile : ${usersNoProfile.rows[0].count} ${usersNoProfile.rows[0].count > 0 ? '❌ NEEDS FIX' : '✅'}`);

    // 6. Match Data
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('6️⃣  MATCH DATA INTEGRITY');
    console.log('═══════════════════════════════════════════════════════════');
    
    const matchStatus = await client.query(`
      SELECT status, COUNT(*) as count FROM matches GROUP BY status ORDER BY count DESC
    `);
    const orphanedPlayers = await client.query(`
      SELECT COUNT(*) as count FROM "matchPlayers" mp
      WHERE NOT EXISTS (SELECT 1 FROM matches m WHERE m.id = mp."matchId")
    `);
    
    matchStatus.rows.forEach(row => {
      console.log(`  ${row.status.padEnd(15)} : ${row.count} matches`);
    });
    console.log(`  Orphaned players : ${orphanedPlayers.rows[0].count} ${orphanedPlayers.rows[0].count > 0 ? '⚠️ NEEDS CLEANUP' : '✅'}`);

    // 7. Forum System
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('7️⃣  FORUM SYSTEM');
    console.log('═══════════════════════════════════════════════════════════');
    
    const categories = await client.query(`
      SELECT id, title, COUNT(t.id) as thread_count
      FROM forum_categories fc
      LEFT JOIN forum_threads t ON t."category_id" = fc.id
      GROUP BY fc.id, fc.title
      ORDER BY thread_count DESC
    `);
    
    if (categories.rows.length === 0) {
      console.log('  ❌ NO FORUM CATEGORIES FOUND! Initialize forum.');
    } else {
      categories.rows.forEach(cat => {
        console.log(`  "${cat.title}" : ${cat.thread_count} threads`);
      });
    }

    // 8. Cosmetics
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('8️⃣  COSMETICS SHOP');
    console.log('═══════════════════════════════════════════════════════════');
    
    const cosmetics = await client.query(`
      SELECT type, rarity, COUNT(*) as count FROM cosmetics
      WHERE "isActive" = true
      GROUP BY type, rarity
      ORDER BY type, rarity
    `);
    
    if (cosmetics.rows.length === 0) {
      console.log('  ⚠️  NO ACTIVE COSMETICS FOUND! Seed shop.');
    } else {
      cosmetics.rows.forEach(item => {
        console.log(`  ${item.type.padEnd(10)} - ${item.rarity.padEnd(10)} : ${item.count} items`);
      });
    }

    // 9. Recommendations
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📋 RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const totalUsers = healthCheck.rows.find(r => r.metric === 'Users').value;
    const adminCount = healthCheck.rows.find(r => r.metric === 'Admins').value;
    const forumCats = healthCheck.rows.find(r => r.metric === 'Forum Categories').value;
    const activeCosmetics = cosmetics.rows.reduce((sum, row) => sum + row.count, 0);
    
    console.log(adminCount > 0 ? '✅' : '❌', 'Admin users exist');
    console.log(usersNoProfile.rows[0].count === 0 ? '✅' : '❌', 'All users have profiles');
    console.log(noEmail.rows[0].count === 0 ? '✅' : '❌', 'All users have emails');
    console.log(forumCats > 0 ? '✅' : '❌', 'Forum categories initialized');
    console.log(activeCosmetics > 0 ? '✅' : '❌', 'Cosmetics available in shop');
    console.log(orphanedSessions.rows[0].count === 0 ? '✅' : '⚠️', 'No orphaned sessions');

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✨ AUDIT COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runAudit();
