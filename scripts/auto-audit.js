#!/usr/bin/env node

/**
 * AUTO-AUDIT WITH LOGGING
 * This script runs the full audit and logs everything to a file automatically
 */

const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const logFile = 'AUDIT_RESULTS_' + new Date().toISOString().replace(/:/g, '-').substring(0, 19) + '.log';
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  console.log(message);
  logStream.write(message + '\n');
}

async function runAudit() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    log('╔════════════════════════════════════════════════════════════════════════════╗');
    log('║              ECLIP DATABASE AUDIT - AUTO LOGGED                           ║');
    log('║                        ' + new Date().toISOString());
    log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    log('🔌 Connecting to Neon database...');
    await client.connect();
    log('✅ Connected!\n');

    // Database info
    const dbInfo = await client.query(`
      SELECT current_database() as database, current_user as user, NOW() as current_time
    `);
    const db = dbInfo.rows[0];
    
    log('📊 DATABASE INFO:');
    log(`  Database: ${db.database}`);
    log(`  User: ${db.user}`);
    log(`  Server Time: ${db.current_time}\n`);

    // Health check
    log('═══════════════════════════════════════════════════════════════════════════');
    log('📈 DATA STATISTICS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

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
      SELECT 'Forum Threads', COUNT(*) FROM forum_threads
      UNION ALL
      SELECT 'Forum Categories', COUNT(*) FROM forum_categories
      UNION ALL
      SELECT 'Cosmetics', COUNT(*) FROM cosmetics
      UNION ALL
      SELECT 'User Profiles', COUNT(*) FROM user_profiles
      ORDER BY metric
    `);

    stats.rows.forEach(row => {
      const val = parseInt(row.count);
      let icon = '✓';
      if (row.metric === 'Admins' && val === 0) icon = '❌';
      if (row.metric === 'Forum Categories' && val === 0) icon = '❌';
      log(`  ${icon} ${row.metric.padEnd(20)} : ${val}`);
    });

    // Admin check
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('🔐 ADMIN USERS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const admins = await client.query(`
      SELECT id, username, email, role, "email_verified" FROM users WHERE role = 'ADMIN'
    `);

    if (admins.rows.length === 0) {
      log('❌ NO ADMIN USERS FOUND - CRITICAL ISSUE!');
    } else {
      log(`✅ Found ${admins.rows.length} admin(s):`);
      admins.rows.forEach(admin => {
        const verified = admin.email_verified ? '✅' : '❌';
        log(`   • ${admin.username} (${admin.email}) ${verified}`);
      });
    }

    // Top users
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('🏆 TOP 5 USERS BY ESR');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const topUsers = await client.query(`
      SELECT username, esr, level, role FROM users WHERE esr > 0 ORDER BY esr DESC LIMIT 5
    `);

    if (topUsers.rows.length === 0) {
      log('(No users with ESR data)');
    } else {
      topUsers.rows.forEach((user, idx) => {
        log(`  ${idx + 1}. ${user.username.padEnd(20)} ESR: ${user.esr} | Level: ${user.level} | ${user.role}`);
      });
    }

    // Recommendations
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('💡 RECOMMENDATIONS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const adminCount = stats.rows.find(r => r.metric === 'Admins').count;
    const forumCats = stats.rows.find(r => r.metric === 'Forum Categories').count;
    const profiles = stats.rows.find(r => r.metric === 'User Profiles').count;
    const users = stats.rows.find(r => r.metric === 'Users').count;

    const issues = [];
    if (adminCount == 0) issues.push('❌ Create an admin user - CRITICAL');
    if (forumCats == 0) issues.push('❌ Initialize forum categories - CRITICAL');
    if (profiles < users) issues.push(`⚠️  ${users - profiles} users missing profiles`);
    
    if (issues.length === 0) {
      log('✅ Database is in excellent health!');
    } else {
      issues.forEach(issue => log(`  ${issue}`));
    }

    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('✨ AUDIT COMPLETE');
    log('═══════════════════════════════════════════════════════════════════════════\n');
    log(`📁 Results saved to: ${logFile}\n`);

  } catch (error) {
    log('\n❌ ERROR: ' + error.message + '\n');
  } finally {
    await client.end();
    logStream.end();
  }
}

runAudit();
