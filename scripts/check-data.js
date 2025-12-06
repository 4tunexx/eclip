const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n📊 CHECKING PLATFORM DATA\n');

    // Missions
    const missions = await pool.query(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN is_daily = true THEN 1 ELSE 0 END) as daily,
             SUM(CASE WHEN is_daily = false THEN 1 ELSE 0 END) as regular
      FROM missions WHERE is_active = true
    `);
    console.log('📋 MISSIONS:');
    console.log(`   Total: ${missions.rows[0].total}`);
    console.log(`   Daily: ${missions.rows[0].daily}`);
    console.log(`   Regular: ${missions.rows[0].regular}\n`);

    // Achievements
    const achievements = await pool.query(`
      SELECT COUNT(*) as total FROM achievements WHERE is_active = true
    `);
    console.log('🏆 ACHIEVEMENTS:');
    console.log(`   Total: ${achievements.rows[0].total}\n`);

    // Badges
    const badges = await pool.query(`
      SELECT COUNT(*) as total FROM badges
    `);
    console.log('🎖️ BADGES:');
    console.log(`   Total: ${badges.rows[0].total}\n`);

    // Cosmetics breakdown
    const cosmetics = await pool.query(`
      SELECT type, COUNT(*) as count FROM cosmetics WHERE is_active = true GROUP BY type ORDER BY type
    `);
    console.log('🎨 COSMETICS:');
    cosmetics.rows.forEach(row => console.log(`   ${row.type}: ${row.count}`));
    console.log();

    // User progression
    const admin = await pool.query(`
      SELECT email, level, xp, esr, rank, coins FROM users WHERE email = 'admin@eclip.pro' LIMIT 1
    `);
    if (admin.rows.length > 0) {
      const user = admin.rows[0];
      console.log('👤 ADMIN USER:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Level: ${user.level}, XP: ${user.xp}`);
      console.log(`   Rank: ${user.rank}, ESR: ${user.esr}`);
      console.log(`   Coins: ${user.coins}\n`);
    }

    // Check if VIP/subscription tables exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%vip%' OR table_name ILIKE '%subscription%' OR table_name ILIKE '%purchase%')
    `);
    console.log(`🔍 VIP/SUBSCRIPTION TABLES: ${tables.rows.length > 0 ? tables.rows.map(r => r.table_name).join(', ') : '❌ NONE - NEEDS CREATION'}`);

    await pool.end();
  } catch(e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
