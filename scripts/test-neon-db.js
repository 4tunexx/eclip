const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔗 Connecting to Neon Database...\n');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to Neon Database\n');
    
    // Get database version
    const versionResult = await client.query('SELECT version();');
    console.log('📊 Database Version:', versionResult.rows[0].version.split(',')[0], '\n');
    
    // Count users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users;');
    const userCount = parseInt(usersResult.rows[0].count);
    console.log(`👥 Total Users: ${userCount}`);
    
    // Get admin count
    const adminResult = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE role = 'ADMIN' OR "isAdmin" = true;
    `);
    const adminCount = parseInt(adminResult.rows[0].count);
    console.log(`🔐 Admin Users: ${adminCount}`);
    
    // Get active sessions
    const sessionResult = await client.query('SELECT COUNT(*) as count FROM sessions;');
    const sessionCount = parseInt(sessionResult.rows[0].count);
    console.log(`🔑 Active Sessions: ${sessionCount}`);
    
    // Check last 5 users
    const lastUsersResult = await client.query(`
      SELECT id, username, email, role, "email_verified", "steam_id", "created_at" 
      FROM users 
      ORDER BY "created_at" DESC 
      LIMIT 5;
    `);
    console.log('\n📋 Last 5 Registered Users:');
    lastUsersResult.rows.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.username} (${user.email})`);
      console.log(`     Role: ${user.role}, Email Verified: ${user.email_verified}`);
      console.log(`     Steam: ${user.steam_id ? 'Connected' : 'Not connected'}`);
    });
    
    // Check forum threads
    const threadsResult = await client.query(`
      SELECT COUNT(*) as count FROM "forumThreads";
    `).catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`\n📝 Forum Threads: ${threadsResult.rows[0].count}`);
    
    // Check matches
    const matchesResult = await client.query(`
      SELECT COUNT(*) as count FROM matches;
    `).catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`🎮 Matches: ${matchesResult.rows[0].count}`);
    
    // Check missions
    const missionsResult = await client.query(`
      SELECT COUNT(*) as count FROM missions;
    `).catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`📌 Missions: ${missionsResult.rows[0].count}`);
    
    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`\n📚 Database Tables (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    client.release();
    console.log('\n✅ All checks passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();
