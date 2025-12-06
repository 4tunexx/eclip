const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n📋 CHECKING DATABASE TABLES...\n');

    // Check users table
    console.log('1️⃣  Checking "users" table:');
    let result = await pool.query(`
      SELECT COUNT(*) as count FROM users
    `);
    console.log(`   Count: ${result.rows[0].count} users`);
    
    // Check User table
    console.log('\n2️⃣  Checking "User" table (legacy):');
    result = await pool.query(`
      SELECT COUNT(*) as count FROM "User"
    `);
    console.log(`   Count: ${result.rows[0].count} users`);
    
    // List all tables
    console.log('\n3️⃣  All tables in database:');
    result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    result.rows.forEach(r => console.log(`   - ${r.table_name}`));
    
    // Check sessions table
    console.log('\n4️⃣  Checking "sessions" table:');
    try {
      result = await pool.query(`
        SELECT COUNT(*) as count FROM sessions
      `);
      console.log(`   Count: ${result.rows[0].count} sessions`);
      
      // List recent sessions
      result = await pool.query(`
        SELECT id, user_id, created_at FROM sessions ORDER BY created_at DESC LIMIT 5
      `);
      console.log('   Recent sessions:');
      result.rows.forEach(r => console.log(`     - ${r.id} (user: ${r.user_id})`));
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Check Session table (legacy)
    console.log('\n5️⃣  Checking "Session" table (legacy):');
    try {
      result = await pool.query(`
        SELECT COUNT(*) as count FROM "Session"
      `);
      console.log(`   Count: ${result.rows[0].count} sessions`);
      
      result = await pool.query(`
        SELECT id, userId, createdAt FROM "Session" ORDER BY "createdAt" DESC LIMIT 5
      `);
      console.log('   Recent sessions:');
      result.rows.forEach(r => console.log(`     - ${r.id} (user: ${r.userId})`));
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Get your user info
    console.log('\n6️⃣  Your user account (airijuz@gmail.com):');
    result = await pool.query(`
      SELECT id, email, username, role FROM "User" WHERE email = 'airijuz@gmail.com'
    `);
    if (result.rows.length > 0) {
      console.log('   Found in User table:');
      console.log(`   - ID: ${result.rows[0].id}`);
      console.log(`   - Email: ${result.rows[0].email}`);
      console.log(`   - Username: ${result.rows[0].username}`);
      console.log(`   - Role: ${result.rows[0].role}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
