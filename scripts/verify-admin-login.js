const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n🔍 Checking admin user...\n');
    
    const result = await pool.query(`
      SELECT id, email, username, password_hash, role, level, xp, rank, mmr, coins
      FROM users 
      WHERE email = 'admin@eclip.pro'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found in users table!');
      console.log('\n📋 Creating admin user...\n');
      
      const hash = await bcrypt.hash('Admin123!', 10);
      const created = await pool.query(`
        INSERT INTO users (email, username, password_hash, role, level, xp, rank, mmr, coins)
        VALUES ('admin@eclip.pro', 'admin', $1, 'ADMIN', 1, 1050, 'Bronze', 1000, 0)
        RETURNING id, email, username, role
      `, [hash]);
      
      console.log('✅ Admin user created:', created.rows[0]);
    } else {
      const admin = result.rows[0];
      console.log('✅ Admin user found:');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Username:', admin.username);
      console.log('   Role:', admin.role);
      console.log('   Level:', admin.level);
      console.log('   XP:', admin.xp);
      console.log('   Coins:', admin.coins);
      
      // Test password
      const testPassword = 'Admin123!';
      const isValid = await bcrypt.compare(testPassword, admin.password_hash);
      console.log('\n🔑 Password test:');
      console.log('   Testing password:', testPassword);
      console.log('   Result:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\n⚠️  Password invalid! Updating...');
        const newHash = await bcrypt.hash(testPassword, 10);
        await pool.query(`
          UPDATE users SET password_hash = $1 WHERE email = 'admin@eclip.pro'
        `, [newHash]);
        console.log('✅ Password updated!');
      }
    }
    
    console.log('\n✅ Admin login ready!');
    console.log('   Email: admin@eclip.pro');
    console.log('   Password: Admin123!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
})();
