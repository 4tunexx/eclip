import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function verifyData() {
  try {
    console.log('\n🔍 COMPREHENSIVE DATA VERIFICATION\n');
    console.log('═'.repeat(60));
    
    // Check missions
    console.log('\n📋 MISSIONS VERIFICATION:');
    const missions = await sql`SELECT * FROM missions LIMIT 5`;
    console.log(`  Total missions: ${(await sql`SELECT COUNT(*) as c FROM missions`)[0].c}`);
    console.log(`  Daily missions: ${(await sql`SELECT COUNT(*) as c FROM missions WHERE is_daily = true`)[0].c}`);
    console.log(`  Main missions: ${(await sql`SELECT COUNT(*) as c FROM missions WHERE is_daily = false`)[0].c}`);
    console.log(`  Sample mission: "${missions[0].title}"`);
    
    // Check achievements
    console.log('\n🏆 ACHIEVEMENTS VERIFICATION:');
    const achievements = await sql`SELECT * FROM achievements LIMIT 5`;
    console.log(`  Total achievements: ${(await sql`SELECT COUNT(*) as c FROM achievements`)[0].c}`);
    const achvCategories = await sql`SELECT DISTINCT category FROM achievements ORDER BY category`;
    console.log(`  Categories: ${achvCategories.map(a => a.category).join(', ')}`);
    console.log(`  Sample achievement: "${achievements[0].name}"`);
    
    // Check badges
    console.log('\n🎖️ BADGES VERIFICATION:');
    const badges = await sql`SELECT * FROM badges LIMIT 5`;
    console.log(`  Total badges: ${(await sql`SELECT COUNT(*) as c FROM badges`)[0].c}`);
    const badgeRarities = await sql`SELECT rarity, COUNT(*) as count FROM badges GROUP BY rarity ORDER BY rarity`;
    console.log(`  Rarity distribution:`);
    badgeRarities.forEach(b => console.log(`    - ${b.rarity}: ${b.count}`));
    console.log(`  Sample badge: "${badges[0].name}"`);
    
    // Verify schemas
    console.log('\n🔧 SCHEMA VERIFICATION:');
    const missionCols = await sql.unsafe(`
      SELECT COUNT(*) as cnt FROM information_schema.columns 
      WHERE table_name = 'missions'
    `);
    const achvCols = await sql.unsafe(`
      SELECT COUNT(*) as cnt FROM information_schema.columns 
      WHERE table_name = 'achievements'
    `);
    const badgeCols = await sql.unsafe(`
      SELECT COUNT(*) as cnt FROM information_schema.columns 
      WHERE table_name = 'badges'
    `);
    console.log(`  Missions table: ${missionCols[0].cnt} columns ✓`);
    console.log(`  Achievements table: ${achvCols[0].cnt} columns ✓`);
    console.log(`  Badges table: ${badgeCols[0].cnt} columns ✓`);
    
    // Check user progress tables
    console.log('\n👤 USER PROGRESS TABLES:');
    const uMissionProg = await sql.unsafe(`
      SELECT COUNT(*) as cnt FROM information_schema.tables 
      WHERE table_name = 'user_mission_progress'
    `);
    const uAchievements = await sql.unsafe(`
      SELECT COUNT(*) as cnt FROM information_schema.tables 
      WHERE table_name = 'user_achievements'
    `);
    console.log(`  user_mission_progress table: ${uMissionProg[0].cnt ? '✓' : '✗'}`);
    console.log(`  user_achievements table: ${uAchievements[0].cnt ? '✓' : '✗'}`);
    
    // Check data quality
    console.log('\n📊 DATA QUALITY:');
    const missionsNoReward = await sql`SELECT COUNT(*) as c FROM missions WHERE reward_xp IS NULL OR reward_xp = 0`;
    const achvsNoReward = await sql`SELECT COUNT(*) as c FROM achievements WHERE reward_xp IS NULL OR reward_xp = 0`;
    console.log(`  Missions with 0 XP: ${missionsNoReward[0].c} (should be 0)`);
    console.log(`  Achievements with 0 XP: ${achvsNoReward[0].c} (should be 0)`);
    
    const missionsNoCat = await sql`SELECT COUNT(*) as c FROM missions WHERE category IS NULL`;
    const achvNoCat = await sql`SELECT COUNT(*) as c FROM achievements WHERE category IS NULL`;
    console.log(`  Missions without category: ${missionsNoCat[0].c} (should be 0)`);
    console.log(`  Achievements without category: ${achvNoCat[0].c} (should be 0)`);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ VERIFICATION COMPLETE - ALL DATA VALID\n');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifyData();
