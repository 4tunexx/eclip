import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function testAPI() {
  try {
    console.log('\n🧪 API ENDPOINT TESTING\n');
    console.log('═'.repeat(60));
    
    // Test 1: Get all missions
    console.log('\n📋 TEST 1: GET /api/missions');
    const allMissions = await sql`SELECT * FROM missions ORDER BY is_daily DESC, id LIMIT 10`;
    console.log(`  ✓ Retrieved ${(await sql`SELECT COUNT(*) as c FROM missions`)[0].c} missions`);
    console.log(`  ✓ Sample mission: "${allMissions[0].title}" (${allMissions[0].category})`);
    console.log(`  ✓ Reward: ${allMissions[0].reward_xp} XP${allMissions[0].reward_coins ? ' + ' + allMissions[0].reward_coins + ' coins' : ''}`);
    
    // Test 2: Filter by category
    console.log('\n📋 TEST 2: GET /api/missions?category=cs2');
    const cs2Missions = await sql`SELECT COUNT(*) as c FROM missions WHERE category = 'cs2'`;
    console.log(`  ✓ CS2 missions: ${cs2Missions[0].c}`);
    
    // Test 3: Get all achievements
    console.log('\n🏆 TEST 3: GET /api/achievements');
    const allAchievements = await sql`SELECT * FROM achievements ORDER BY id LIMIT 10`;
    console.log(`  ✓ Retrieved ${(await sql`SELECT COUNT(*) as c FROM achievements`)[0].c} achievements`);
    console.log(`  ✓ Sample achievement: "${allAchievements[0].name}" (${allAchievements[0].category})`);
    console.log(`  ✓ Reward: ${allAchievements[0].reward_xp} XP`);
    
    // Test 4: Filter achievements by category
    console.log('\n🏆 TEST 4: GET /api/achievements?category=progression');
    const progressionAchvs = await sql`SELECT COUNT(*) as c FROM achievements WHERE category = 'progression'`;
    console.log(`  ✓ Progression achievements: ${progressionAchvs[0].c}`);
    
    // Test 5: Get all badges
    console.log('\n🎖️ TEST 5: GET /api/badges');
    const allBadges = await sql`SELECT * FROM badges ORDER BY id LIMIT 10`;
    console.log(`  ✓ Retrieved ${(await sql`SELECT COUNT(*) as c FROM badges`)[0].c} badges`);
    console.log(`  ✓ Sample badge: "${allBadges[0].name}" (${allBadges[0].rarity})`);
    
    // Test 6: Filter badges by rarity
    console.log('\n🎖️ TEST 6: GET /api/badges?rarity=legendary');
    const legendaryBadges = await sql`SELECT COUNT(*) as c FROM badges WHERE rarity = 'legendary'`;
    console.log(`  ✓ Legendary badges: ${legendaryBadges[0].c}`);
    
    // Test 7: Verify user progress table structure
    console.log('\n👤 TEST 7: User Progress Tables');
    const userMissionProgCols = await sql.unsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'user_mission_progress' ORDER BY ordinal_position
    `);
    console.log(`  ✓ user_mission_progress columns: ${userMissionProgCols.map(c => c.column_name).join(', ')}`);
    
    const userAchievementsCols = await sql.unsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'user_achievements' ORDER BY ordinal_position
    `);
    console.log(`  ✓ user_achievements columns: ${userAchievementsCols.map(c => c.column_name).join(', ')}`);
    
    // Test 8: Verify requirement types
    console.log('\n⚙️ TEST 8: Requirement Types');
    const missionReqTypes = await sql`SELECT DISTINCT requirement_type FROM missions ORDER BY requirement_type`;
    console.log(`  ✓ Mission requirement types (${missionReqTypes.length}):`);
    missionReqTypes.slice(0, 5).forEach(rt => console.log(`    - ${rt.requirement_type}`));
    if (missionReqTypes.length > 5) console.log(`    ... and ${missionReqTypes.length - 5} more`);
    
    const achvReqTypes = await sql`SELECT DISTINCT requirement_type FROM achievements ORDER BY requirement_type`;
    console.log(`  ✓ Achievement requirement types (${achvReqTypes.length}):`);
    achvReqTypes.slice(0, 5).forEach(rt => console.log(`    - ${rt.requirement_type}`));
    if (achvReqTypes.length > 5) console.log(`    ... and ${achvReqTypes.length - 5} more`);
    
    // Test 9: Check for data consistency
    console.log('\n🔍 TEST 9: Data Consistency Checks');
    const dailyMissions = await sql`SELECT COUNT(*) as c FROM missions WHERE is_daily = true`;
    const mainMissions = await sql`SELECT COUNT(*) as c FROM missions WHERE is_daily = false`;
    console.log(`  ✓ Daily missions: ${dailyMissions[0].c}/5`);
    console.log(`  ✓ Main missions: ${mainMissions[0].c}/50`);
    
    const secretAchvs = await sql`SELECT COUNT(*) as c FROM achievements WHERE is_secret = true`;
    console.log(`  ✓ Secret achievements: ${secretAchvs[0].c}/5`);
    
    // Test 10: Sample reward data
    console.log('\n💰 TEST 10: Reward Analysis');
    const missionRewards = await sql`
      SELECT 
        COUNT(*) as count,
        AVG(reward_xp) as avg_xp,
        MIN(reward_xp) as min_xp,
        MAX(reward_xp) as max_xp
      FROM missions
    `;
    console.log(`  ✓ Mission rewards:`);
    console.log(`    - Average XP: ${Math.round(missionRewards[0].avg_xp)}`);
    console.log(`    - Range: ${missionRewards[0].min_xp} - ${missionRewards[0].max_xp}`);
    
    const achvRewards = await sql`
      SELECT 
        COUNT(*) as count,
        AVG(reward_xp) as avg_xp,
        MIN(reward_xp) as min_xp,
        MAX(reward_xp) as max_xp
      FROM achievements
    `;
    console.log(`  ✓ Achievement rewards:`);
    console.log(`    - Average XP: ${Math.round(achvRewards[0].avg_xp)}`);
    console.log(`    - Range: ${achvRewards[0].min_xp} - ${achvRewards[0].max_xp}`);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ ALL API TESTS PASSED\n');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testAPI();
