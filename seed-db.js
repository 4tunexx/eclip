const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  try {
    // Check tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n=== TABLES ===');
    tables.rows.forEach(r => console.log(r.table_name));

    // Check counts
    const counts = await pool.query(`
      SELECT 'users' as table_name, COUNT(*) as count FROM users
      UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
      UNION ALL SELECT 'missions', COUNT(*) FROM missions
      UNION ALL SELECT 'cosmetics', COUNT(*) FROM cosmetics
      UNION ALL SELECT 'esr_thresholds', COUNT(*) FROM esr_thresholds
      UNION ALL SELECT 'badges', COUNT(*) FROM badges
    `);
    
    console.log('\n=== COUNTS ===');
    counts.rows.forEach(r => console.log(`${r.table_name}: ${r.count}`));

    // Create achievements if missing
    if (counts.rows.find(r => r.table_name === 'achievements')?.count === '0') {
      console.log('\n=== CREATING ACHIEVEMENTS ===');
      await pool.query(`
        INSERT INTO achievements (name, description, category, requirement_type, requirement_value, target, reward_xp, is_active)
        VALUES 
        ('First Blood', 'Get your first kill', 'COMBAT', 'kill_count', '1', 1, 100, true),
        ('Sharpshooter', 'Get 100 headshot kills', 'COMBAT', 'headshot_kills', '100', 100, 500, true),
        ('Level 10', 'Reach level 10', 'LEVEL', 'level', '10', 10, 200, true),
        ('Gold Rank', 'Reach Gold rank', 'ESR', 'esr', '1600', 1600, 1000, true),
        ('Win Streak', 'Win 5 matches in a row', 'COMBAT', 'win_streak', '5', 5, 300, true)
      `);
      console.log('✅ Created 5 achievements');
    }

    // Create missions if missing
    if (counts.rows.find(r => r.table_name === 'missions')?.count === '0') {
      console.log('\n=== CREATING MISSIONS ===');
      await pool.query(`
        INSERT INTO missions (title, description, category, requirement_type, requirement_value, target, reward_xp, reward_coins, is_daily, is_active)
        VALUES 
        ('Win 1 Match', 'Win a competitive match', 'DAILY', 'win_match', '1', 1, 100, 50, true, true),
        ('Get 10 Kills', 'Get 10 kills today', 'DAILY', 'kill_count', '10', 10, 150, 75, true, true),
        ('Play 3 Matches', 'Complete 3 matches', 'DAILY', 'match_count', '3', 3, 200, 100, true, true)
      `);
      console.log('✅ Created 3 missions');
    }

    // Create cosmetics if missing
    if (counts.rows.find(r => r.table_name === 'cosmetics')?.count === '0') {
      console.log('\n=== CREATING COSMETICS ===');
      await pool.query(`
        INSERT INTO cosmetics (name, description, type, rarity, price, is_active)
        VALUES 
        ('Gold Frame', 'Premium gold avatar frame', 'Frame', 'Epic', 500, true),
        ('Victory Banner', 'Show off your wins', 'Banner', 'Rare', 300, true),
        ('Champion Badge', 'Elite player badge', 'Badge', 'Legendary', 1000, true),
        ('Silver Frame', 'Classic silver frame', 'Frame', 'Rare', 250, true),
        ('Pro Title', 'Professional player title', 'Title', 'Epic', 750, true)
      `);
      console.log('✅ Created 5 cosmetics');
    }

    // Create ESR thresholds if missing
    if (counts.rows.find(r => r.table_name === 'esr_thresholds')?.count === '0') {
      console.log('\n=== CREATING ESR THRESHOLDS ===');
      const tiers = [
        { tier: 'Bronze', ranges: [[0, 325], [325, 650], [650, 975], [975, 1300]], color: '#CD7F32' },
        { tier: 'Silver', ranges: [[1300, 1375], [1375, 1450], [1450, 1525], [1525, 1600]], color: '#C0C0C0' },
        { tier: 'Gold', ranges: [[1600, 1675], [1675, 1750], [1750, 1825], [1825, 1900]], color: '#FFD700' },
        { tier: 'Platinum', ranges: [[1900, 2000], [2000, 2100], [2100, 2150], [2150, 2200]], color: '#E5E4E2' },
        { tier: 'Diamond', ranges: [[2200, 2400], [2400, 2700], [2700, 3000], [3000, 5000]], color: '#B9F2FF' }
      ];
      
      for (const tierData of tiers) {
        for (let i = 0; i < 4; i++) {
          await pool.query(`
            INSERT INTO esr_thresholds (tier, division, min_esr, max_esr, color)
            VALUES ($1, $2, $3, $4, $5)
          `, [tierData.tier, 4 - i, tierData.ranges[i][0], tierData.ranges[i][1], tierData.color]);
        }
      }
      console.log('✅ Created 20 ESR thresholds');
    }

    console.log('\n✅ DONE!\n');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
