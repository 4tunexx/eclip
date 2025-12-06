import postgres from 'postgres';
import 'dotenv/config';

async function testProgression() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    console.log('🎮 PROGRESSION SYSTEM TEST');
    console.log('=========================\n');

    // 1. Check admin user current state
    const [admin] = await sql`
      SELECT id, username, level, xp, mmr, rank, coins, rank_tier, rank_division 
      FROM users 
      WHERE email = 'admin@eclip.pro'
    `;

    console.log('📊 Admin User Starting State:');
    console.table([{
      username: admin.username,
      level: admin.level,
      xp: admin.xp,
      mmr: admin.mmr,
      rank: admin.rank,
      rank_tier: admin.rank_tier,
      rank_division: admin.rank_division,
      coins: admin.coins,
    }]);

    // 2. Get sample missions and their rewards
    console.log('\n🎯 Sample Missions (Reward XP/Coins):');
    const missions = await sql`
      SELECT id, title, category, target, reward_xp, reward_coins, is_daily 
      FROM missions 
      LIMIT 10
    `;
    console.table(missions.map(m => ({
      title: m.title.substring(0, 25),
      category: m.category,
      target: m.target,
      reward_xp: m.reward_xp,
      reward_coins: m.reward_coins,
      daily: m.is_daily ? 'Yes' : 'No',
    })));

    // 3. Get sample achievements and their rewards
    console.log('\n🏆 Sample Achievements (Reward XP/Badge):');
    const achievements = await sql`
      SELECT id, code, name, category, target, reward_xp, reward_badge_id 
      FROM achievements 
      LIMIT 10
    `;
    console.table(achievements.map(a => ({
      code: a.code,
      name: a.name.substring(0, 25),
      category: a.category,
      target: a.target,
      reward_xp: a.reward_xp,
      has_badge: a.reward_badge_id ? 'Yes' : 'No',
    })));

    // 4. Simulate completing a mission
    console.log('\n⚡ SIMULATING: Admin completes "Warm-Up Win" mission (+250 XP, +10 coins)');
    const [mission] = await sql`SELECT id, reward_xp, reward_coins FROM missions WHERE title = 'Warm-Up Win' LIMIT 1`;
    
    if (mission) {
      const newXp = admin.xp + mission.reward_xp;
      const newCoins = (admin.coins || 0) + mission.reward_coins;

      // Update user
      await sql`
        UPDATE users 
        SET xp = ${newXp}, coins = ${newCoins}, updated_at = NOW()
        WHERE id = ${admin.id}
      `;

      // Create progress record
      await sql`
        INSERT INTO user_mission_progress (user_id, mission_id, progress, completed, completed_at)
        VALUES (${admin.id}, ${mission.id}, 1, true, NOW())
        ON CONFLICT DO NOTHING
      `;

      console.log(`  ✓ XP: ${admin.xp} → ${newXp} (+${mission.reward_xp})`);
      console.log(`  ✓ Coins: ${admin.coins} → ${newCoins} (+${mission.reward_coins})`);
    }

    // 5. Simulate completing an achievement
    console.log('\n⚡ SIMULATING: Admin unlocks "Welcome to Eclip" achievement (+100 XP, +badge)');
    const [achievement] = await sql`
      SELECT id, reward_xp, reward_badge_id FROM achievements 
      WHERE code = 'ACHV_001' 
      LIMIT 1
    `;
    
    if (achievement) {
      const [currentUser] = await sql`
        SELECT xp, coins FROM users WHERE id = ${admin.id}
      `;

      const newXp2 = currentUser.xp + achievement.reward_xp;

      await sql`
        UPDATE users 
        SET xp = ${newXp2}, updated_at = NOW()
        WHERE id = ${admin.id}
      `;

      await sql`
        INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
        VALUES (${admin.id}, ${achievement.id}, NOW())
        ON CONFLICT DO NOTHING
      `;

      console.log(`  ✓ XP: ${currentUser.xp} → ${newXp2} (+${achievement.reward_xp})`);
      if (achievement.reward_badge_id) {
        const [badge] = await sql`SELECT name FROM badges WHERE id = ${achievement.reward_badge_id}`;
        console.log(`  ✓ Badge Unlocked: ${badge?.name || 'Unknown'}`);
      }
    }

    // 6. Show final user state
    const [updatedAdmin] = await sql`
      SELECT id, username, level, xp, mmr, rank, coins, rank_tier, rank_division 
      FROM users 
      WHERE email = 'admin@eclip.pro'
    `;

    console.log('\n📊 Admin User After Progression:');
    console.table([{
      username: updatedAdmin.username,
      level: updatedAdmin.level,
      xp: updatedAdmin.xp,
      mmr: updatedAdmin.mmr,
      rank: updatedAdmin.rank,
      rank_tier: updatedAdmin.rank_tier,
      rank_division: updatedAdmin.rank_division,
      coins: updatedAdmin.coins,
    }]);

    // 7. Show user's mission/achievement progress
    console.log('\n📈 User Mission Progress:');
    const userMissions = await sql`
      SELECT m.title, ump.progress, m.target, ump.completed, ump.completed_at
      FROM user_mission_progress ump
      JOIN missions m ON ump.mission_id = m.id
      WHERE ump.user_id = ${admin.id}
      LIMIT 5
    `;
    if (userMissions.length) {
      console.table(userMissions.map(m => ({
        title: m.title.substring(0, 25),
        progress: `${m.progress}/${m.target}`,
        completed: m.completed ? '✓' : '✗',
        completed_at: m.completed_at ? new Date(m.completed_at).toLocaleString() : '-',
      })));
    } else {
      console.log('  (None yet)');
    }

    console.log('\n🏆 User Achievement Progress:');
    const userAchievements = await sql`
      SELECT a.name, ua.unlocked_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ${admin.id}
      LIMIT 5
    `;
    if (userAchievements.length) {
      console.table(userAchievements.map(a => ({
        name: a.name.substring(0, 25),
        unlocked_at: a.unlocked_at ? new Date(a.unlocked_at).toLocaleString() : '-',
      })));
    } else {
      console.log('  (None yet)');
    }

    // 8. Show progression formulas
    console.log('\n📐 Progression Formulas (Expected):');
    console.log('  Level Up: When XP crosses level thresholds (e.g., 100 XP → Level 2)');
    console.log('  Rank Up: When MMR increases sufficiently (1000 → Bronze, 1200 → Silver, etc.)');
    console.log('  Tier/Division: Sub-rank system within each rank');
    console.log('  Badges: Unlock when achievements are earned');
    console.log('  Coins: Earned from missions and achievements');

    console.log('\n✅ Progression system test complete!\n');

  } catch (error) {
    console.error('Test failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

testProgression();
