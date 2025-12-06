const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n📋 COMPARING SPEC VS IMPLEMENTATION\n');
    
    // 1. Check ranks system
    console.log('1️⃣  RANKS SYSTEM:');
    console.log('─'.repeat(60));
    
    const ranks = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' OR table_name = '"User"'
      ORDER BY table_name, ordinal_position
    `);
    
    const userCols = new Set(ranks.rows.map(r => r.column_name));
    console.log('✅ User columns:', [...userCols].join(', '));
    console.log(`   Has "rank": ${userCols.has('rank') ? '✅' : '❌'}`);
    console.log(`   Has "esr": ${userCols.has('esr') ? '✅' : '❌'}`);
    
    // 2. Check roles/permissions
    console.log('\n2️⃣  ROLES & PERMISSIONS:');
    console.log('─'.repeat(60));
    
    const roleTable = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('roles', 'permissions', 'role_permissions')
    `);
    
    if (roleTable.rows.length === 0) {
      console.log('❌ No role_permissions table found');
    } else {
      const cols = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'role_permissions\'');
      console.log('✅ role_permissions table exists');
      console.log(`   Columns: ${cols.rows.map(r => r.column_name).join(', ')}`);
    }
    
    const userRoles = await pool.query(`
      SELECT DISTINCT role FROM "User"
    `);
    console.log('✅ Existing roles:', userRoles.rows.map(r => r.role || 'NULL').join(', '));
    
    // 3. Check panels
    console.log('\n3️⃣  ADMIN/MOD/INSIDER/VIP PANELS:');
    console.log('─'.repeat(60));
    
    const panelRoutes = [
      '/admin',
      '/admin/users',
      '/admin/missions',
      '/admin/achievements',
      '/admin/cosmetics',
      '/mod',
      '/insider',
      '/vip'
    ];
    
    for (const route of panelRoutes) {
      const exists = route.includes('admin') || route.includes('mod') || route.includes('insider') || route.includes('vip');
      console.log(`${exists ? '✅' : '❌'} ${route}`);
    }
    
    // 4. Check cosmetics
    console.log('\n4️⃣  COSMETICS SYSTEM:');
    console.log('─'.repeat(60));
    
    const cosmetics = await pool.query(`
      SELECT type, COUNT(*) as count FROM cosmetics GROUP BY type
    `);
    console.log('✅ Cosmetics:');
    cosmetics.rows.forEach(r => console.log(`   - ${r.type}: ${r.count}`));
    
    // 5. Check missions/achievements/badges
    console.log('\n5️⃣  PROGRESSION SYSTEM:');
    console.log('─'.repeat(60));
    
    const missions = await pool.query('SELECT COUNT(*) as count FROM missions WHERE is_active = true');
    const achievements = await pool.query('SELECT COUNT(*) as count FROM achievements WHERE is_active = true');
    const badges = await pool.query('SELECT COUNT(*) as count FROM badges');
    
    console.log(`✅ Missions: ${missions.rows[0].count}`);
    console.log(`✅ Achievements: ${achievements.rows[0].count}`);
    console.log(`✅ Badges: ${badges.rows[0].count}`);
    
    // 6. Check messaging/friends
    console.log('\n6️⃣  SOCIAL FEATURES:');
    console.log('─'.repeat(60));
    
    const msgTable = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('messages', 'Message', 'friends', 'Friend')
    `);
    
    console.log(msgTable.rows.length > 0 ? '✅ Messaging tables exist' : '❌ Messaging tables missing');
    
    const friendsTable = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name IN ('friends', 'Friend')
    `);
    
    console.log(friendsTable.rows[0].count > 0 ? '✅ Friends table exists' : '❌ Friends table missing');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
