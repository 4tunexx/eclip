#!/usr/bin/env node

/**
 * ECLIP DATABASE QUICK CHECK
 * Lightweight database health check with output logging
 * Usage: node scripts/db-quick-check.js 2>&1 | tee db-check-results.log
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const startTime = new Date();

async function runCheck() {
  let client;
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║              ECLIP DATABASE QUICK HEALTH CHECK');
    console.log('║                        ' + new Date().toISOString());
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    if (!process.env.DATABASE_URL) {
      console.log('❌ ERROR: DATABASE_URL not set in .env.local');
      return;
    }

    console.log('🔌 Connecting to Neon database...\n');
    
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Get database info
    const dbInfoRes = await client.query(`
      SELECT current_database() as database, 
             current_user as user,
             NOW() as current_time
    `);
    
    const dbInfo = dbInfoRes.rows[0];
    console.log('📊 Database Information:');
    console.log(`  Database: ${dbInfo.database}`);
    console.log(`  User: ${dbInfo.user}`);
    console.log(`  Server Time: ${dbInfo.current_time}\n`);

    // Table stats
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('📈 DATA STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const stats = await client.query(`
      SELECT 'Users' as metric, COUNT(*) as count FROM users
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
      SELECT 'Match Players', COUNT(*) FROM match_players
      UNION ALL
      SELECT 'Forum Threads', COUNT(*) FROM forum_threads
      UNION ALL
      SELECT 'Forum Categories', COUNT(*) FROM forum_categories
      UNION ALL
      SELECT 'Forum Posts', COUNT(*) FROM forum_posts
      UNION ALL
      SELECT 'Cosmetics', COUNT(*) FROM cosmetics
      UNION ALL
      SELECT 'User Profiles', COUNT(*) FROM "user_profiles"
      UNION ALL
      SELECT 'Notifications', COUNT(*) FROM notifications
      ORDER BY metric ASC
    `);

    stats.rows.forEach(row => {
      const val = parseInt(row.count);
      let status = '✓';
      if (row.metric.includes('Admin') && val === 0) status = '❌';
      if (row.metric.includes('Forum Categories') && val === 0) status = '❌';
      if (row.metric.includes('User Profiles') && val === 0) status = '⚠️';
      
      console.log(`  ${status} ${row.metric.padEnd(25)} : ${val}`);
    });

    // Health checks
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('🏥 HEALTH CHECKS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // Admin check
    const admins = await client.query(`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`);
    const adminCount = parseInt(admins.rows[0].count);
    console.log(`${adminCount > 0 ? '✅' : '❌'} Admin Users Exist: ${adminCount}`);

    // User profiles
    const missingProfiles = await client.query(`
      SELECT COUNT(*) as count FROM users u
      WHERE NOT EXISTS (SELECT 1 FROM "user_profiles" p WHERE p."userId" = u.id)
    `);
    const profileCount = parseInt(missingProfiles.rows[0].count);
    console.log(`${profileCount === 0 ? '✅' : '⚠️'} Users Missing Profiles: ${profileCount}`);

    // Email check
    const noEmail = await client.query(`SELECT COUNT(*) as count FROM users WHERE email IS NULL OR email = ''`);
    const noEmailCount = parseInt(noEmail.rows[0].count);
    console.log(`${noEmailCount === 0 ? '✅' : '⚠️'} Users Missing Email: ${noEmailCount}`);

    // Session cleanup
    const expiredSessions = await client.query(`
      SELECT COUNT(*) as count FROM sessions WHERE "expires_at" < NOW() - INTERVAL '7 days'
    `);
    const expiredCount = parseInt(expiredSessions.rows[0].count);
    console.log(`${expiredCount === 0 ? '✅' : '⚠️'} Old Expired Sessions (7+ days): ${expiredCount}`);

    // Orphaned records
    const orphanedPlayers = await client.query(`
      SELECT COUNT(*) as count FROM "matchPlayers" mp
      WHERE NOT EXISTS (SELECT 1 FROM matches m WHERE m.id = mp."matchId")
    `);
    const orphanedCount = parseInt(orphanedPlayers.rows[0].count);
    console.log(`${orphanedCount === 0 ? '✅' : '⚠️'} Orphaned Match Players: ${orphanedCount}`);

    // Forum categories
    const forumCats = await client.query(`SELECT COUNT(*) as count FROM "forumCategories"`);
    const catCount = parseInt(forumCats.rows[0].count);
    console.log(`${catCount > 0 ? '✅' : '❌'} Forum Categories Initialized: ${catCount}`);

    // Cosmetics
    const cosmetics = await client.query(`
      SELECT COUNT(*) as count FROM cosmetics WHERE "isActive" = true
    `);
    const cosmeticCount = parseInt(cosmetics.rows[0].count);
    console.log(`${cosmeticCount > 0 ? '✅' : '⚠️'} Active Cosmetics Available: ${cosmeticCount}`);

    // Top users by ESR
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('🏆 TOP 5 USERS BY ESR');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const topUsers = await client.query(`
      SELECT username, esr, level, role FROM users 
      WHERE esr > 0
      ORDER BY esr DESC 
      LIMIT 5
    `);

    if (topUsers.rows.length === 0) {
      console.log('  (No users with ESR data)');
    } else {
      topUsers.rows.forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.username.padEnd(20)} - ESR: ${user.esr} | Level: ${user.level} | Role: ${user.role}`);
      });
    }

    // Recent matches
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('⚡ RECENT MATCHES');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const recentMatches = await client.query(`
      SELECT id, status, "mapName", "createdAt"
      FROM matches
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);

    if (recentMatches.rows.length === 0) {
      console.log('  (No recent matches)');
    } else {
      recentMatches.rows.forEach((match, idx) => {
        const date = new Date(match.createdAt).toLocaleString();
        console.log(`  ${idx + 1}. ${match.id.substring(0, 8)}... - ${match.status.padEnd(10)} | Map: ${match.mapName} | ${date}`);
      });
    }

    // Recent users
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('👥 RECENT USERS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const recentUsers = await client.query(`
      SELECT username, email, role, "createdAt"
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);

    if (recentUsers.rows.length === 0) {
      console.log('  (No users)');
    } else {
      recentUsers.rows.forEach((user, idx) => {
        const date = new Date(user.createdAt).toLocaleDateString();
        console.log(`  ${idx + 1}. ${user.username.padEnd(20)} | ${user.email} | ${user.role.padEnd(10)} | ${date}`);
      });
    }

    // Recommendations
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('💡 RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const recommendations = [];
    
    if (adminCount === 0) {
      recommendations.push('❌ CRITICAL: Create an admin user for system management');
    }
    if (catCount === 0) {
      recommendations.push('❌ CRITICAL: Initialize forum categories');
    }
    if (profileCount > 0) {
      recommendations.push(`⚠️ Create missing user profiles for ${profileCount} users`);
    }
    if (expiredCount > 0) {
      recommendations.push(`⚠️ Clean up ${expiredCount} old expired sessions`);
    }
    if (orphanedCount > 0) {
      recommendations.push(`⚠️ Remove ${orphanedCount} orphaned match player records`);
    }
    if (noEmailCount > 0) {
      recommendations.push(`⚠️ ${noEmailCount} users have no email address`);
    }
    if (cosmeticCount === 0) {
      recommendations.push('ℹ️ Seed cosmetics shop with items');
    }

    if (recommendations.length === 0) {
      console.log('  ✅ Database is in excellent health!');
    } else {
      recommendations.forEach(rec => {
        console.log(`  ${rec}`);
      });
    }

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log(`✨ CHECK COMPLETE (${duration}s)`);
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Cannot connect to database - check DATABASE_URL');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   DNS resolution failed - check your internet connection');
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

runCheck();
