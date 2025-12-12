#!/usr/bin/env node
/**
 * Populate missing/empty tables with seed data
 * - user_cosmetics: Link users to cosmetics
 * - leaderboards: Create leaderboard rankings
 * - user_subscriptions: Initialize VIP subscriptions
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDatabase() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         SEEDING EMPTY TABLES                            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Get admin user
    const adminRes = await pool.query(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
    const adminId = adminRes.rows[0]?.id;
    
    if (!adminId) {
      console.error('❌ No admin user found');
      process.exit(1);
    }
    
    console.log(`✅ Found admin user: ${adminId}\n`);

    // 1. POPULATE USER_COSMETICS (give admin some cosmetics)
    console.log('📝 Populating user_cosmetics...');
    const cosmeticRes = await pool.query(`
      SELECT id FROM cosmetics LIMIT 5
    `);
    
    let cosmeticsAdded = 0;
    for (const cosmetic of cosmeticRes.rows) {
      try {
        await pool.query(`
          INSERT INTO user_cosmetics (user_id, cosmetic_id) 
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [adminId, cosmetic.id]);
        cosmeticsAdded++;
      } catch (e) {
        // Skip duplicates
      }
    }
    console.log(`  ✅ Added ${cosmeticsAdded} cosmetics to admin\n`);

    // 2. POPULATE LEADERBOARDS
    console.log('📝 Populating leaderboards...');
    const usersRes = await pool.query(`
      SELECT id, username, esr, level FROM users ORDER BY esr DESC
    `);
    
    let leaderboardsAdded = 0;
    for (let i = 0; i < usersRes.rows.length; i++) {
      const user = usersRes.rows[i];
      try {
        await pool.query(`
          INSERT INTO leaderboards (user_id, rank, esr_points, matches_played, win_rate)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id) DO UPDATE SET
            rank = EXCLUDED.rank,
            esr_points = EXCLUDED.esr_points
        `, [user.id, i + 1, user.esr, 0, 0]);
        leaderboardsAdded++;
      } catch (e) {
        // Skip duplicates
      }
    }
    console.log(`  ✅ Created ${leaderboardsAdded} leaderboard entries\n`);

    // 3. POPULATE USER_SUBSCRIPTIONS (VIP subscriptions)
    console.log('📝 Populating user_subscriptions...');
    const vipRes = await pool.query(`
      SELECT id, is_vip FROM users WHERE is_vip = true
    `);
    
    let subscriptionsAdded = 0;
    for (const user of vipRes.rows) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      try {
        await pool.query(`
          INSERT INTO user_subscriptions (user_id, purchase_date, expires_at, auto_renew, renewal_day, total_cost_coins, status)
          VALUES ($1, NOW(), $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [user.id, expiresAt, true, 1, 100, 'active']);
        subscriptionsAdded++;
      } catch (e) {
        // Skip duplicates
      }
    }
    console.log(`  ✅ Added ${subscriptionsAdded} VIP subscriptions\n`);

    // 4. VERIFY POPULATION
    console.log('📊 VERIFICATION:\n');
    const verifyQueries = [
      ['user_cosmetics', `SELECT COUNT(*) as cnt FROM user_cosmetics`],
      ['leaderboards', `SELECT COUNT(*) as cnt FROM leaderboards`],
      ['user_subscriptions', `SELECT COUNT(*) as cnt FROM user_subscriptions`]
    ];

    for (const [name, query] of verifyQueries) {
      const result = await pool.query(query);
      const count = result.rows[0].cnt;
      console.log(`  ✅ ${name.padEnd(25)} = ${count} rows`);
    }

    console.log('\n✅ Database seeding complete!\n');
    await pool.end();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

seedDatabase();
