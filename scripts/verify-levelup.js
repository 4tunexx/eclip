import postgres from 'postgres';
import 'dotenv/config';

async function verifyLevelUp() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    console.log('🎮 LEVEL-UP VERIFICATION TEST');
    console.log('==============================\n');

    const [user] = await sql`
      SELECT 
        username, 
        xp, 
        level,
        calculate_level_from_xp(xp) as calculated_level,
        rank,
        rank_tier,
        rank_division
      FROM users 
      WHERE email = 'admin@eclip.pro'
    `;

    console.log('📊 Admin User Current State:');
    console.table([{
      username: user.username,
      xp: user.xp,
      current_level_in_db: user.level,
      calculated_level: user.calculated_level,
      rank: user.rank,
      rank_tier: user.rank_tier,
      rank_division: user.rank_division,
    }]);

    console.log('\n⚡ LEVEL-UP SIMULATION:');
    console.log(`Current XP: ${user.xp} → Calculated Level: ${user.calculated_level}`);
    console.log(`  (Formula: floor(${user.xp} / 100) + 1 = ${user.calculated_level})`);

    // Show progression path
    console.log('\n📈 Progression Path:');
    const xpThresholds = [0, 100, 200, 300, 500, 1000, 2000, 5000, 10000];
    console.table(xpThresholds.map(xp => ({
      xp,
      level: Math.floor(xp / 100) + 1,
      milestone: xp === 100 ? '🎯 Lvl 2' : xp === 500 ? '🎯 Lvl 6' : xp === 1000 ? '🎯 Lvl 11' : xp === 5000 ? '🎯 Lvl 51' : ''
    })));

    console.log('\n✅ Next Steps for Level-Up:');
    const xpNeeded = (user.calculated_level * 100) - user.xp;
    console.log(`  Current: ${user.xp} XP (Level ${user.calculated_level})`);
    console.log(`  Next Level: ${user.calculated_level + 1}`);
    console.log(`  XP Needed: +${xpNeeded > 0 ? xpNeeded : 0} XP`);
    console.log(`  Complete ${Math.ceil(xpNeeded / 250)} more "Warm-Up Win" missions to level up!`);

    console.log('\n✅ Verification Complete!\n');

  } catch (error) {
    console.error('Verification failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

verifyLevelUp();
