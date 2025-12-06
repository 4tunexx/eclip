const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function checkDatabase() {
  try {
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n=== DATABASE TABLES ===\n');
    tablesResult.rows.forEach(row => {
      console.log('✓', row.table_name);
    });

    // Check row counts for key tables
    console.log('\n=== TABLE ROW COUNTS ===\n');

    const tables = [
      'users',
      'achievements',
      'user_achievements',
      'badges',
      'cosmetics',
      'user_inventory',
      'missions',
      'user_mission_progress',
      'esr_thresholds',
      'matches',
      'match_players',
      'forums',
      'forum_posts',
      'transactions',
      'shop_items',
      'notifications'
    ];

    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${countResult.rows[0].count} rows`);
      } catch (e) {
        console.log(`${table}: TABLE NOT FOUND`);
      }
    }

    // Check users data
    console.log('\n=== USERS SAMPLE ===\n');
    const usersResult = await pool.query(`
      SELECT id, username, email, level, xp, rank, esr, role 
      FROM users 
      LIMIT 3
    `);
    console.log('Sample users:', usersResult.rows);

    // Check achievements
    console.log('\n=== ACHIEVEMENTS ===\n');
    const achievementsResult = await pool.query(`
      SELECT COUNT(*) as count FROM achievements
    `);
    console.log('Total achievements:', achievementsResult.rows[0].count);

    // Check user achievements progress
    console.log('\n=== USER ACHIEVEMENTS PROGRESS ===\n');
    const userAchievementsResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_achievements
    `);
    console.log('Total user achievement records:', userAchievementsResult.rows[0].count);

    // Check missions
    console.log('\n=== MISSIONS ===\n');
    const missionsResult = await pool.query(`
      SELECT COUNT(*) as count FROM missions
    `);
    console.log('Total missions:', missionsResult.rows[0].count);

    // Check match records
    console.log('\n=== MATCHES ===\n');
    const matchesResult = await pool.query(`
      SELECT COUNT(*) as count FROM matches
    `);
    console.log('Total matches recorded:', matchesResult.rows[0].count);

    // Check shop inventory
    console.log('\n=== COSMETICS/SHOP ===\n');
    const cosmeticsResult = await pool.query(`
      SELECT COUNT(*) as count FROM cosmetics
    `);
    console.log('Total cosmetics in shop:', cosmeticsResult.rows[0].count);

    // Check user inventory
    console.log('\n=== USER INVENTORY ===\n');
    const inventoryResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_inventory
    `);
    console.log('Total items in user inventories:', inventoryResult.rows[0].count);

    // Check ESR tiers
    console.log('\n=== ESR TIERS & DIVISIONS ===\n');
    const esrResult = await pool.query(`
      SELECT COUNT(DISTINCT tier) as tiers, COUNT(DISTINCT division) as divisions
      FROM esr_thresholds
    `);
    console.log('ESR configuration:', esrResult.rows[0]);

    console.log('\n✅ Database verification complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
