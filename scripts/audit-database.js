require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function auditDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          🔍 ECLIP DATABASE AUDIT REPORT 🔍               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. Schema Overview
    console.log('📋 1. DATABASE SCHEMA OVERVIEW');
    console.log('━'.repeat(60));
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`Total Tables: ${tables.rows.length}\n`);
    tables.rows.forEach(row => console.log(`  • ${row.table_name}`));

    // 2. Users Table Audit
    console.log('\n👥 2. USERS TABLE AUDIT');
    console.log('━'.repeat(60));
    const userCount = await client.query('SELECT COUNT(*) as count FROM users;');
    console.log(`Total Users: ${userCount.rows[0].count}`);

    const adminCount = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE role = 'ADMIN' OR role = 'admin';
    `);
    console.log(`Admin Users: ${adminCount.rows[0].count}`);

    const emailVerifiedCount = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE "email_verified" = true;
    `);
    console.log(`Email Verified: ${emailVerifiedCount.rows[0].count}`);

    const steamConnectedCount = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE "steam_id" IS NOT NULL 
      AND "steam_id" != '' 
      AND "steam_id" NOT LIKE 'temp-%';
    `);
    console.log(`Steam Connected: ${steamConnectedCount.rows[0].count}`);

    // 3. Check for issues
    console.log('\n⚠️  3. POTENTIAL DATA ISSUES');
    console.log('━'.repeat(60));

    // Missing emails
    const noEmail = await client.query(`
      SELECT COUNT(*) as count FROM users WHERE email IS NULL;
    `);
    if (noEmail.rows[0].count > 0) {
      console.log(`❌ Users with no email: ${noEmail.rows[0].count}`);
    }

    // Missing usernames
    const noUsername = await client.query(`
      SELECT COUNT(*) as count FROM users WHERE username IS NULL OR username = '';
    `);
    if (noUsername.rows[0].count > 0) {
      console.log(`❌ Users with no username: ${noUsername.rows[0].count}`);
    }

    // Invalid roles
    const invalidRoles = await client.query(`
      SELECT role, COUNT(*) as count FROM users 
      WHERE role NOT IN ('USER', 'VIP', 'INSIDER', 'MODERATOR', 'ADMIN')
      GROUP BY role;
    `);
    if (invalidRoles.rows.length > 0) {
      console.log(`❌ Invalid roles found:`);
      invalidRoles.rows.forEach(row => {
        console.log(`   • ${row.role}: ${row.count} users`);
      });
    } else {
      console.log(`✅ All roles are valid`);
    }

    // Users with temp steam IDs
    const tempSteam = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE "steam_id" LIKE 'temp-%' OR "steam_id" = '';
    `);
    if (tempSteam.rows[0].count > 0) {
      console.log(`⚠️  Users with placeholder Steam IDs: ${tempSteam.rows[0].count}`);
    }

    // 4. Sessions Audit
    console.log('\n🔑 4. SESSIONS TABLE AUDIT');
    console.log('━'.repeat(60));
    const sessionCount = await client.query('SELECT COUNT(*) as count FROM sessions;');
    console.log(`Total Sessions: ${sessionCount.rows[0].count}`);

    // Expired sessions
    const expiredSessions = await client.query(`
      SELECT COUNT(*) as count FROM sessions 
      WHERE "expires_at" < NOW();
    `);
    console.log(`Expired Sessions: ${expiredSessions.rows[0].count}`);

    // Active sessions
    const activeSessions = await client.query(`
      SELECT COUNT(*) as count FROM sessions 
      WHERE "expires_at" >= NOW();
    `);
    console.log(`Active Sessions: ${activeSessions.rows[0].count}`);

    // 5. Matches Data
    console.log('\n🎮 5. MATCHES TABLE AUDIT');
    console.log('━'.repeat(60));
    const matchCount = await client.query('SELECT COUNT(*) as count FROM matches;');
    console.log(`Total Matches: ${matchCount.rows[0].count}`);

    const liveMatches = await client.query(`
      SELECT COUNT(*) as count FROM matches WHERE status = 'LIVE';
    `);
    console.log(`Live Matches: ${liveMatches.rows[0].count}`);

    const finishedMatches = await client.query(`
      SELECT COUNT(*) as count FROM matches WHERE status = 'FINISHED';
    `);
    console.log(`Finished Matches: ${finishedMatches.rows[0].count}`);

    // 6. Forum Data
    console.log('\n📝 6. FORUM DATA AUDIT');
    console.log('━'.repeat(60));
    try {
      const threadCount = await client.query('SELECT COUNT(*) as count FROM "forumThreads";');
      console.log(`Forum Threads: ${threadCount.rows[0].count}`);

      const categoryCount = await client.query('SELECT COUNT(*) as count FROM "forumCategories";');
      console.log(`Forum Categories: ${categoryCount.rows[0].count}`);
    } catch (e) {
      console.log(`⚠️  Forum tables not accessible or don't exist`);
    }

    // 7. Cosmetics
    console.log('\n🎨 7. COSMETICS INVENTORY');
    console.log('━'.repeat(60));
    try {
      const cosmeticCount = await client.query('SELECT COUNT(*) as count FROM cosmetics;');
      console.log(`Total Cosmetics: ${cosmeticCount.rows[0].count}`);

      const inventoryCount = await client.query('SELECT COUNT(*) as count FROM "user_inventory";');
      console.log(`Inventory Items: ${inventoryCount.rows[0].count}`);
    } catch (e) {
      console.log(`⚠️  Cosmetics tables not accessible or don't exist`);
    }

    // 8. User Profiles
    console.log('\n👤 8. USER PROFILES');
    console.log('━'.repeat(60));
    try {
      const profileCount = await client.query('SELECT COUNT(*) as count FROM "user_profiles";');
      console.log(`User Profiles: ${profileCount.rows[0].count}`);

      const totalUsers = parseInt(userCount.rows[0].count);
      const totalProfiles = parseInt(profileCount.rows[0].count);
      const missingProfiles = totalUsers - totalProfiles;
      
      if (missingProfiles > 0) {
        console.log(`⚠️  Missing Profiles: ${missingProfiles} users have no profile`);
      } else {
        console.log(`✅ All users have profiles`);
      }
    } catch (e) {
      console.log(`⚠️  User profiles table issue`);
    }

    // 9. Check for orphaned records
    console.log('\n🔗 9. DATA INTEGRITY CHECKS');
    console.log('━'.repeat(60));

    // Sessions pointing to non-existent users
    const orphanedSessions = await client.query(`
      SELECT COUNT(*) as count FROM sessions s
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = s."userId");
    `);
    if (orphanedSessions.rows[0].count > 0) {
      console.log(`❌ Orphaned sessions: ${orphanedSessions.rows[0].count}`);
    } else {
      console.log(`✅ No orphaned sessions`);
    }

    // 10. Admin users list
    console.log('\n🔐 10. ADMIN USERS');
    console.log('━'.repeat(60));
    const admins = await client.query(`
      SELECT id, username, email, role, "email_verified", "created_at" 
      FROM users 
      WHERE role = 'ADMIN' 
      ORDER BY "created_at";
    `);
    if (admins.rows.length === 0) {
      console.log(`⚠️  NO ADMIN USERS FOUND! Create one immediately!`);
    } else {
      console.log(`Admin Users (${admins.rows.length}):`);
      admins.rows.forEach((admin, idx) => {
        const verified = admin.email_verified ? '✅' : '❌';
        console.log(`  ${idx + 1}. ${admin.username} (${admin.email}) ${verified}`);
      });
    }

    // 11. Recent registrations
    console.log('\n📅 11. RECENT REGISTRATIONS (Last 10)');
    console.log('━'.repeat(60));
    const recent = await client.query(`
      SELECT id, username, email, role, "email_verified", "created_at" 
      FROM users 
      ORDER BY "created_at" DESC 
      LIMIT 10;
    `);
    recent.rows.forEach((user, idx) => {
      const verified = user.email_verified ? '✅' : '❌';
      const date = new Date(user.created_at).toLocaleDateString();
      console.log(`  ${idx + 1}. ${user.username} (${user.role}) - ${verified} ${date}`);
    });

    // 12. Database size and health
    console.log('\n📊 12. DATABASE HEALTH');
    console.log('━'.repeat(60));
    const dbSize = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `);
    console.log(`Database Size: ${dbSize.rows[0].size}`);

    // 13. Check for common missing fields
    console.log('\n🔍 13. SCHEMA VALIDATION');
    console.log('━'.repeat(60));
    const userColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY column_name;
    `);
    const requiredFields = ['id', 'email', 'username', 'role', 'email_verified', 'steam_id'];
    const existingFields = userColumns.rows.map(r => r.column_name);
    
    console.log(`Users table has ${userColumns.rows.length} columns:`);
    requiredFields.forEach(field => {
      if (existingFields.includes(field)) {
        console.log(`  ✅ ${field}`);
      } else {
        console.log(`  ❌ MISSING: ${field}`);
      }
    });

    console.log('\n' + '═'.repeat(60));
    console.log('✅ AUDIT COMPLETE');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Audit Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

auditDatabase();
