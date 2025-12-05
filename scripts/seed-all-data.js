import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

// 5 DAILY MISSIONS
const DAILY_MISSIONS = [
  { id: 'DAILY_001', title: 'Warm-Up Win', description: 'Win 1 ranked match today.', category: 'cs2', requirementType: 'win_matches_today', target: 1, rewardXp: 250, rewardCoins: 10, isDaily: true },
  { id: 'DAILY_002', title: 'Match Grinder', description: 'Play 2 ranked matches today.', category: 'cs2', requirementType: 'matches_today', target: 2, rewardXp: 200, rewardCoins: 8, isDaily: true },
  { id: 'DAILY_003', title: 'Headshot Check', description: 'Get 15 headshot kills today.', category: 'cs2', requirementType: 'hs_kills_today', target: 15, rewardXp: 260, rewardCoins: 10, isDaily: true },
  { id: 'DAILY_004', title: 'Team Player', description: 'Get 10 assists today.', category: 'cs2', requirementType: 'assists_today', target: 10, rewardXp: 220, rewardCoins: 8, isDaily: true },
  { id: 'DAILY_005', title: 'Eclip Habit', description: 'Log in and visit your dashboard today.', category: 'platform', requirementType: 'dashboard_visit_today', target: 1, rewardXp: 150, rewardCoins: 5, isDaily: true },
];

// 20 PLATFORM/SOCIAL + 30 CS2/PROGRESSION MISSIONS
const MAIN_MISSIONS = [
  { id: 'PLATFORM_001', title: 'Profile Complete', description: 'Fill out your profile bio and social links.', category: 'platform', requirementType: 'profile_complete', target: 1, rewardXp: 300, rewardCoins: 15 },
  { id: 'PLATFORM_002', title: 'Face Reveal', description: 'Upload a custom avatar to your profile.', category: 'platform', requirementType: 'avatar_uploaded', target: 1, rewardXp: 250, rewardCoins: 10 },
  { id: 'PLATFORM_003', title: 'Banner Time', description: 'Equip a profile banner.', category: 'cosmetic', requirementType: 'banner_equipped', target: 1, rewardXp: 250, rewardCoins: 10 },
  { id: 'PLATFORM_004', title: 'Frame It', description: 'Equip an avatar frame.', category: 'cosmetic', requirementType: 'frame_equipped', target: 1, rewardXp: 250, rewardCoins: 10 },
  { id: 'PLATFORM_005', title: 'Show-Off', description: 'Equip at least two cosmetics at the same time.', category: 'cosmetic', requirementType: 'cosmetics_equipped_set', target: 1, rewardXp: 350, rewardCoins: 15 },
  { id: 'PLATFORM_006', title: 'First Friend', description: 'Add 1 friend on Eclip.', category: 'social', requirementType: 'friends_added', target: 1, rewardXp: 200, rewardCoins: 8 },
  { id: 'PLATFORM_007', title: 'Squad Builder', description: 'Add 5 friends on Eclip.', category: 'social', requirementType: 'friends_added', requirementValue: '5', target: 5, rewardXp: 300, rewardCoins: 12 },
  { id: 'PLATFORM_008', title: 'Forum Newcomer', description: 'Create your first forum post.', category: 'social', requirementType: 'forum_posts', target: 1, rewardXp: 250, rewardCoins: 10 },
  { id: 'PLATFORM_009', title: 'Forum Regular', description: 'Create 10 forum posts.', category: 'social', requirementType: 'forum_posts', target: 10, rewardXp: 400, rewardCoins: 15 },
  { id: 'PLATFORM_010', title: 'Helpful Voice', description: 'Receive 5 upvotes on your forum posts.', category: 'social', requirementType: 'forum_upvotes', target: 5, rewardXp: 350, rewardCoins: 15 },
  { id: 'PLATFORM_011', title: 'Daily Grinder', description: 'Complete 5 daily missions in total.', category: 'progression', requirementType: 'dailies_completed_total', target: 5, rewardXp: 400, rewardCoins: 15 },
  { id: 'PLATFORM_012', title: 'Weekly Warrior', description: 'Complete 15 daily missions in total.', category: 'progression', requirementType: 'dailies_completed_total', target: 15, rewardXp: 600, rewardCoins: 25 },
  { id: 'PLATFORM_013', title: 'Chat Starter', description: 'Send 5 direct messages.', category: 'social', requirementType: 'dm_sent', target: 5, rewardXp: 250, rewardCoins: 10 },
  { id: 'PLATFORM_014', title: 'Chatty', description: 'Send 25 direct messages.', category: 'social', requirementType: 'dm_sent', target: 25, rewardXp: 400, rewardCoins: 15 },
  { id: 'PLATFORM_015', title: 'Login Streak I', description: 'Log in 3 days in a row.', category: 'progression', requirementType: 'login_streak', target: 3, rewardXp: 350, rewardCoins: 15 },
  { id: 'PLATFORM_016', title: 'Login Streak II', description: 'Log in 7 days in a row.', category: 'progression', requirementType: 'login_streak', target: 7, rewardXp: 600, rewardCoins: 25 },
  { id: 'PLATFORM_017', title: 'Fully Verified', description: 'Verify your email and connect your Steam account.', category: 'platform', requirementType: 'fully_verified', target: 1, rewardXp: 400, rewardCoins: 15 },
  { id: 'PLATFORM_018', title: 'Level 5 Reached', description: 'Reach account level 5.', category: 'progression', requirementType: 'reach_level', requirementValue: '5', target: 5, rewardXp: 500, rewardCoins: 20 },
  { id: 'PLATFORM_019', title: 'Level 10 Reached', description: 'Reach account level 10.', category: 'progression', requirementType: 'reach_level', requirementValue: '10', target: 10, rewardXp: 800, rewardCoins: 35 },
  { id: 'PLATFORM_020', title: 'Community Member', description: 'Participate in 3 different forum threads.', category: 'social', requirementType: 'different_threads_participated', target: 3, rewardXp: 300, rewardCoins: 12 },
  // CS2 / GAMEPLAY MISSIONS (30)
  { id: 'INGAME_001', title: 'First Blood', description: 'Get the first kill in any match.', category: 'cs2', requirementType: 'first_bloods', target: 1, rewardXp: 250, rewardCoins: 10 },
  { id: 'INGAME_002', title: 'Sharpshooter I', description: 'Get 50 kills in total.', category: 'cs2', requirementType: 'kills_total', target: 50, rewardXp: 350, rewardCoins: 15 },
  { id: 'INGAME_003', title: 'Sharpshooter II', description: 'Get 250 kills in total.', category: 'cs2', requirementType: 'kills_total', target: 250, rewardXp: 700, rewardCoins: 30 },
  { id: 'INGAME_004', title: 'Headshot Starter', description: 'Get 25 headshot kills.', category: 'cs2', requirementType: 'hs_kills', target: 25, rewardXp: 350, rewardCoins: 15 },
  { id: 'INGAME_005', title: 'Headshot Machine', description: 'Get 150 headshot kills.', category: 'cs2', requirementType: 'hs_kills', target: 150, rewardXp: 800, rewardCoins: 35 },
  { id: 'INGAME_006', title: 'Clutch Moment', description: 'Win one clutch (1v2 or worse).', category: 'cs2', requirementType: 'clutches_won', target: 1, rewardXp: 300, rewardCoins: 12 },
  { id: 'INGAME_007', title: 'Clutch King', description: 'Win 10 clutches.', category: 'cs2', requirementType: 'clutches_won', target: 10, rewardXp: 900, rewardCoins: 40 },
  { id: 'INGAME_008', title: 'Bomb Planter', description: 'Plant the bomb 10 times.', category: 'cs2', requirementType: 'bomb_plants', target: 10, rewardXp: 300, rewardCoins: 12 },
  { id: 'INGAME_009', title: 'Bomb Defuser', description: 'Defuse the bomb 5 times.', category: 'cs2', requirementType: 'bomb_defuses', target: 5, rewardXp: 300, rewardCoins: 12 },
  { id: 'INGAME_010', title: 'Entry Fragger', description: 'Get 25 entry kills.', category: 'cs2', requirementType: 'entry_kills', target: 25, rewardXp: 450, rewardCoins: 18 },
  { id: 'INGAME_011', title: 'Support Master', description: 'Get 50 assists.', category: 'cs2', requirementType: 'assists_total', target: 50, rewardXp: 350, rewardCoins: 15 },
  { id: 'INGAME_012', title: 'Damage Dealer', description: 'Deal 10,000 total damage.', category: 'cs2', requirementType: 'damage_total', target: 10000, rewardXp: 500, rewardCoins: 20 },
  { id: 'INGAME_013', title: 'Pistol Pro', description: 'Win 10 pistol rounds.', category: 'cs2', requirementType: 'pistol_round_wins', target: 10, rewardXp: 350, rewardCoins: 15 },
  { id: 'INGAME_014', title: 'Comeback Kid', description: 'Win a match after being down 5 rounds.', category: 'cs2', requirementType: 'comeback_wins', target: 1, rewardXp: 600, rewardCoins: 25 },
  { id: 'INGAME_015', title: 'Eco Hero', description: 'Win 5 rounds with low-cost weapons.', category: 'cs2', requirementType: 'eco_rounds_won', target: 5, rewardXp: 400, rewardCoins: 18 },
  { id: 'INGAME_016', title: 'Ace Hunter', description: 'Get 1 ace (5 kills in a round).', category: 'cs2', requirementType: 'aces', target: 1, rewardXp: 700, rewardCoins: 30 },
  { id: 'INGAME_017', title: 'Multi-Kill Master', description: 'Get 25 multi-kill rounds.', category: 'cs2', requirementType: 'multi_kill_rounds', target: 25, rewardXp: 500, rewardCoins: 20 },
  { id: 'INGAME_018', title: 'Flawless', description: 'Win a match without losing a round.', category: 'cs2', requirementType: 'flawless_match_wins', target: 1, rewardXp: 1000, rewardCoins: 50 },
  { id: 'INGAME_019', title: 'Match Grinder I', description: 'Play 10 matches.', category: 'cs2', requirementType: 'matches_total', target: 10, rewardXp: 400, rewardCoins: 15 },
  { id: 'INGAME_020', title: 'Match Grinder II', description: 'Play 50 matches.', category: 'cs2', requirementType: 'matches_total', target: 50, rewardXp: 900, rewardCoins: 40 },
  { id: 'INGAME_021', title: 'Match Grinder III', description: 'Play 150 matches.', category: 'cs2', requirementType: 'matches_total', target: 150, rewardXp: 1500, rewardCoins: 70 },
  { id: 'INGAME_022', title: 'Win Streak I', description: 'Win 3 matches in a row.', category: 'cs2', requirementType: 'win_streak_best', target: 3, rewardXp: 500, rewardCoins: 20 },
  { id: 'INGAME_023', title: 'Win Streak II', description: 'Win 7 matches in a row.', category: 'cs2', requirementType: 'win_streak_best', target: 7, rewardXp: 900, rewardCoins: 40 },
  { id: 'INGAME_024', title: 'ADR Starter', description: 'Finish a match with ADR ≥ 80.', category: 'cs2', requirementType: 'matches_adr80_plus', target: 1, rewardXp: 400, rewardCoins: 16 },
  { id: 'INGAME_025', title: 'ADR Machine', description: 'Finish 10 matches with ADR ≥ 80.', category: 'cs2', requirementType: 'matches_adr80_plus', target: 10, rewardXp: 900, rewardCoins: 36 },
  { id: 'INGAME_026', title: 'Top Fragger', description: 'Finish a match as top fragger on your team.', category: 'cs2', requirementType: 'top_frag_matches', target: 1, rewardXp: 350, rewardCoins: 15 },
  { id: 'INGAME_027', title: 'MVP Collector', description: 'Earn 15 MVP stars.', category: 'cs2', requirementType: 'mvp_total', target: 15, rewardXp: 500, rewardCoins: 20 },
  { id: 'INGAME_028', title: 'Utility User', description: 'Deal 1500 utility damage.', category: 'cs2', requirementType: 'utility_damage', target: 1500, rewardXp: 450, rewardCoins: 18 },
  { id: 'INGAME_029', title: 'Smokes & Flashes', description: 'Throw 200 smokes or flashes in total.', category: 'cs2', requirementType: 'nades_thrown', target: 200, rewardXp: 350, rewardCoins: 15 },
  { id: 'INGAME_030', title: 'ESR Challenger', description: 'Reach ESR 2000 for the first time.', category: 'progression', requirementType: 'reach_esr', requirementValue: '2000', target: 2000, rewardXp: 1000, rewardCoins: 50 },
];

async function seedMissions() {
  try {
    console.log('🚀 Starting mission seeding (55 missions)...\n');

    const allMissions = [...DAILY_MISSIONS, ...MAIN_MISSIONS];

    for (const mission of allMissions) {
      try {
        await sql`
          INSERT INTO missions (
            title, description, category, requirement_type, requirement_value,
            target, reward_xp, reward_coins, is_daily, is_active
          ) VALUES (
            ${mission.title}, ${mission.description}, ${mission.category},
            ${mission.requirementType}, ${mission.requirementValue || null},
            ${mission.target}, ${mission.rewardXp}, ${mission.rewardCoins},
            ${mission.isDaily || false}, true
          )
          ON CONFLICT DO NOTHING
        `;
      } catch (e) {
        console.log(`  ⚠️ Skipped ${mission.id}: ${e.message.split('\n')[0]}`);
      }
    }

    const result = await sql`SELECT COUNT(*) as count FROM missions`;
    console.log(`✅ Missions seeded: ${result[0].count} total\n`);
  } catch (error) {
    console.error('❌ Error seeding missions:', error);
    process.exit(1);
  }
}

async function seedAchievements() {
  try {
    console.log('🚀 Starting achievement seeding (50 achievements)...\n');

    const ACHIEVEMENTS = [
      { code: 'ACHV_001', title: 'Welcome to Eclip', description: 'Create your account and log in for the first time.', category: 'platform', requirementType: 'account_created', target: 1, rewardXp: 100 },
      { code: 'ACHV_002', title: 'Verified', description: 'Verify your email address.', category: 'platform', requirementType: 'verify_email', target: 1, rewardXp: 150 },
      { code: 'ACHV_003', title: 'Linked Up', description: 'Connect your Steam account.', category: 'platform', requirementType: 'verify_steam', target: 1, rewardXp: 150 },
      { code: 'ACHV_004', title: 'Level 5', description: 'Reach profile level 5.', category: 'progression', requirementType: 'reach_level', requirementValue: '5', target: 5, rewardXp: 300 },
      { code: 'ACHV_005', title: 'Level 10', description: 'Reach profile level 10.', category: 'progression', requirementType: 'reach_level', requirementValue: '10', target: 10, rewardXp: 500 },
      { code: 'ACHV_006', title: 'Level 20', description: 'Reach profile level 20.', category: 'progression', requirementType: 'reach_level', requirementValue: '20', target: 20, rewardXp: 800 },
      { code: 'ACHV_007', title: 'ESR 1000', description: 'Reach 1000 ESR.', category: 'progression', requirementType: 'reach_esr', requirementValue: '1000', target: 1000, rewardXp: 500 },
      { code: 'ACHV_008', title: 'ESR 1500', description: 'Reach 1500 ESR.', category: 'progression', requirementType: 'reach_esr', requirementValue: '1500', target: 1500, rewardXp: 800 },
      { code: 'ACHV_009', title: 'ESR 2000', description: 'Reach 2000 ESR.', category: 'progression', requirementType: 'reach_esr', requirementValue: '2000', target: 2000, rewardXp: 1200 },
      { code: 'ACHV_010', title: 'ESR 2500', description: 'Reach 2500 ESR.', category: 'progression', requirementType: 'reach_esr', requirementValue: '2500', target: 2500, rewardXp: 1500 },
      { code: 'ACHV_011', title: 'Match Veteran I', description: 'Play 50 matches.', category: 'cs2', requirementType: 'matches_total', target: 50, rewardXp: 600 },
      { code: 'ACHV_012', title: 'Match Veteran II', description: 'Play 150 matches.', category: 'cs2', requirementType: 'matches_total', target: 150, rewardXp: 1200 },
      { code: 'ACHV_013', title: 'Match Veteran III', description: 'Play 300 matches.', category: 'cs2', requirementType: 'matches_total', target: 300, rewardXp: 1800 },
      { code: 'ACHV_014', title: 'Win Collector I', description: 'Win 25 matches.', category: 'cs2', requirementType: 'wins_total', target: 25, rewardXp: 600 },
      { code: 'ACHV_015', title: 'Win Collector II', description: 'Win 75 matches.', category: 'cs2', requirementType: 'wins_total', target: 75, rewardXp: 1200 },
      { code: 'ACHV_016', title: 'Win Collector III', description: 'Win 150 matches.', category: 'cs2', requirementType: 'wins_total', target: 150, rewardXp: 2000 },
      { code: 'ACHV_017', title: 'Headshot Enjoyer I', description: 'Get 200 headshot kills.', category: 'cs2', requirementType: 'hs_kills', target: 200, rewardXp: 800 },
      { code: 'ACHV_018', title: 'Headshot Enjoyer II', description: 'Get 500 headshot kills.', category: 'cs2', requirementType: 'hs_kills', target: 500, rewardXp: 1400 },
      { code: 'ACHV_019', title: 'Headshot God', description: 'Get 1000 headshot kills.', category: 'cs2', requirementType: 'hs_kills', target: 1000, rewardXp: 2500 },
      { code: 'ACHV_020', title: 'Clutch Artist', description: 'Win 25 clutches.', category: 'cs2', requirementType: 'clutches_won', target: 25, rewardXp: 2000 },
      { code: 'ACHV_021', title: 'Where We Droppin?', description: 'Play on 5 different maps.', category: 'cs2', requirementType: 'unique_maps_played', target: 5, rewardXp: 700 },
      { code: 'ACHV_022', title: 'Utility Nerd', description: 'Deal 5000 utility damage.', category: 'cs2', requirementType: 'utility_damage', target: 5000, rewardXp: 1000 },
      { code: 'ACHV_023', title: 'MVP Star', description: 'Earn 50 MVP stars.', category: 'cs2', requirementType: 'mvp_total', target: 50, rewardXp: 1200 },
      { code: 'ACHV_024', title: 'Consistency I', description: 'Finish 10 matches with ADR ≥ 80.', category: 'cs2', requirementType: 'matches_adr80_plus', target: 10, rewardXp: 900 },
      { code: 'ACHV_025', title: 'Consistency II', description: 'Finish 25 matches with ADR ≥ 80.', category: 'cs2', requirementType: 'matches_adr80_plus', target: 25, rewardXp: 1500 },
      { code: 'ACHV_026', title: 'No-Life Grinder', description: 'Play Eclip on 7 different days in a week.', category: 'platform', requirementType: 'active_days_in_week', target: 7, rewardXp: 700 },
      { code: 'ACHV_027', title: 'Forum Addict', description: 'Create 50 forum posts.', category: 'social', requirementType: 'forum_posts', target: 50, rewardXp: 800 },
      { code: 'ACHV_028', title: 'Liked Voice', description: 'Receive 50 upvotes on your posts.', category: 'social', requirementType: 'forum_upvotes', target: 50, rewardXp: 900 },
      { code: 'ACHV_029', title: 'Party Leader', description: 'Play 20 matches with a party of 3+.', category: 'social', requirementType: 'party_matches_played', target: 20, rewardXp: 1000 },
      { code: 'ACHV_030', title: 'Social King', description: 'Have 20 friends on Eclip.', category: 'social', requirementType: 'friends_added', target: 20, rewardXp: 1200 },
      { code: 'ACHV_031', title: 'Collector I', description: 'Own 10 cosmetics.', category: 'cosmetic', requirementType: 'cosmetics_owned', target: 10, rewardXp: 400 },
      { code: 'ACHV_032', title: 'Collector II', description: 'Own 25 cosmetics.', category: 'cosmetic', requirementType: 'cosmetics_owned', target: 25, rewardXp: 800 },
      { code: 'ACHV_033', title: 'Collector III', description: 'Own 50 cosmetics.', category: 'cosmetic', requirementType: 'cosmetics_owned', target: 50, rewardXp: 1400 },
      { code: 'ACHV_034', title: 'Drip Check', description: 'Equip a rare or higher cosmetic.', category: 'cosmetic', requirementType: 'equip_rarity', requirementValue: 'rare', target: 1, rewardXp: 500 },
      { code: 'ACHV_035', title: 'Full Set', description: 'Complete any cosmetic set.', category: 'cosmetic', requirementType: 'complete_set', target: 1, rewardXp: 1000 },
      { code: 'ACHV_036', title: 'Loot Goblin', description: 'Open 20 lootboxes.', category: 'cosmetic', requirementType: 'lootbox_opened', target: 20, rewardXp: 800 },
      { code: 'ACHV_037', title: 'Lucky Pull', description: 'Obtain a legendary cosmetic from a lootbox.', category: 'cosmetic', requirementType: 'lootbox_rarity_drop', requirementValue: 'legendary', target: 1, rewardXp: 1600, isSecret: true },
      { code: 'ACHV_038', title: 'Touched by the Stars', description: 'Obtain a celestial cosmetic.', category: 'cosmetic', requirementType: 'lootbox_rarity_drop', requirementValue: 'celestial', target: 1, rewardXp: 2500, isSecret: true },
      { code: 'ACHV_039', title: 'Fashion King', description: 'Equip legendary frame, banner, and title simultaneously.', category: 'cosmetic', requirementType: 'legendary_loadout_equipped', target: 1, rewardXp: 2000, isSecret: true },
      { code: 'ACHV_040', title: 'Perfect Week', description: 'Win at least one match every day for seven days.', category: 'progression', requirementType: 'daily_win_streak', target: 7, rewardXp: 1800 },
      { code: 'ACHV_041', title: 'Tilt-Proof', description: 'Lose 5 matches in a row and still queue again.', category: 'cs2', requirementType: 'loss_streak_then_queue', target: 1, rewardXp: 600, isSecret: true },
      { code: 'ACHV_042', title: 'Comeback Season', description: 'Recover from a 5-loss streak and then win 3 in a row.', category: 'cs2', requirementType: 'comeback_after_loss_streak', target: 1, rewardXp: 1400, isSecret: true },
      { code: 'ACHV_043', title: 'Gentle Giant', description: 'Play 10 matches without receiving a single report.', category: 'social', requirementType: 'matches_no_reports', target: 10, rewardXp: 700 },
      { code: 'ACHV_044', title: 'Team Captain', description: 'Lead a full 5-stack party into 15 matches.', category: 'social', requirementType: 'party_leader_matches', target: 15, rewardXp: 1200 },
      { code: 'ACHV_045', title: 'Insider Vibes', description: 'Participate in 3 test features or insider events.', category: 'event', requirementType: 'insider_events_participated', target: 3, rewardXp: 1000 },
      { code: 'ACHV_046', title: 'Event Hunter', description: 'Complete 5 limited-time event missions.', category: 'event', requirementType: 'event_missions_completed', target: 5, rewardXp: 1200 },
      { code: 'ACHV_047', title: 'Top 100', description: 'Reach top 100 on any leaderboard.', category: 'progression', requirementType: 'leaderboard_rank_top_n', requirementValue: '100', target: 1, rewardXp: 2000 },
      { code: 'ACHV_048', title: 'Top 10', description: 'Reach top 10 on any leaderboard.', category: 'progression', requirementType: 'leaderboard_rank_top_n', requirementValue: '10', target: 1, rewardXp: 3000 },
      { code: 'ACHV_049', title: 'Leaderboard King', description: 'Reach rank #1 on any leaderboard.', category: 'progression', requirementType: 'leaderboard_rank_top_n', requirementValue: '1', target: 1, rewardXp: 5000, isSecret: true },
      { code: 'ACHV_050', title: 'Day One OG', description: 'Play during the first official season of Eclip.', category: 'event', requirementType: 'season_participation', requirementValue: 'Season1', target: 1, rewardXp: 1000 },
    ];

    for (const achv of ACHIEVEMENTS) {
      try {
        await sql`
          INSERT INTO achievements (
            code, name, description, category, requirement_type, requirement_value,
            target, reward_xp, is_secret, is_active
          ) VALUES (
            ${achv.code}, ${achv.title}, ${achv.description}, ${achv.category},
            ${achv.requirementType}, ${achv.requirementValue || null},
            ${achv.target}, ${achv.rewardXp}, ${achv.isSecret || false}, true
          )
          ON CONFLICT (code) DO NOTHING
        `;
      } catch (e) {
        console.log(`  ⚠️ Skipped ${achv.code}`);
      }
    }

    const result = await sql`SELECT COUNT(*) as count FROM achievements`;
    console.log(`✅ Achievements seeded: ${result[0].count} total\n`);
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  }
}

async function seedBadges() {
  try {
    console.log('🚀 Starting badge seeding (50 badges)...\n');

    const BADGES = [
      { code: 'BADGE_001', name: 'Fresh Spawn', description: 'Created an account.', rarity: 'common', iconKey: 'fresh_spawn' },
      { code: 'BADGE_002', name: 'Verified', description: 'Verified email.', rarity: 'common', iconKey: 'verified' },
      { code: 'BADGE_003', name: 'Linked', description: 'Linked Steam account.', rarity: 'common', iconKey: 'linked_steam' },
      { code: 'BADGE_004', name: 'Level 5', description: 'Reached level 5.', rarity: 'common', iconKey: 'level5' },
      { code: 'BADGE_005', name: 'Level 10', description: 'Reached level 10.', rarity: 'common', iconKey: 'level10' },
      { code: 'BADGE_006', name: 'Level 20', description: 'Reached level 20.', rarity: 'uncommon', iconKey: 'level20' },
      { code: 'BADGE_007', name: 'ESR 1000', description: 'Reached 1000 ESR.', rarity: 'uncommon', iconKey: 'esr1000' },
      { code: 'BADGE_008', name: 'ESR 1500', description: 'Reached 1500 ESR.', rarity: 'rare', iconKey: 'esr1500' },
      { code: 'BADGE_009', name: 'ESR 2000', description: 'Reached 2000 ESR.', rarity: 'rare', iconKey: 'esr2000' },
      { code: 'BADGE_010', name: 'ESR 2500', description: 'Reached 2500 ESR.', rarity: 'epic', iconKey: 'esr2500' },
      { code: 'BADGE_011', name: 'Match Vet I', description: 'Played 50 matches.', rarity: 'common', iconKey: 'matches50' },
      { code: 'BADGE_012', name: 'Match Vet II', description: 'Played 150 matches.', rarity: 'uncommon', iconKey: 'matches150' },
      { code: 'BADGE_013', name: 'Match Vet III', description: 'Played 300 matches.', rarity: 'rare', iconKey: 'matches300' },
      { code: 'BADGE_014', name: 'Winner I', description: 'Won 25 matches.', rarity: 'common', iconKey: 'wins25' },
      { code: 'BADGE_015', name: 'Winner II', description: 'Won 75 matches.', rarity: 'uncommon', iconKey: 'wins75' },
      { code: 'BADGE_016', name: 'Winner III', description: 'Won 150 matches.', rarity: 'rare', iconKey: 'wins150' },
      { code: 'BADGE_017', name: 'HS Enjoyer I', description: '200 headshots.', rarity: 'common', iconKey: 'hs200' },
      { code: 'BADGE_018', name: 'HS Enjoyer II', description: '500 headshots.', rarity: 'uncommon', iconKey: 'hs500' },
      { code: 'BADGE_019', name: 'HS God', description: '1000 headshots.', rarity: 'epic', iconKey: 'hs1000' },
      { code: 'BADGE_020', name: 'Clutch Artist', description: '25 clutches.', rarity: 'epic', iconKey: 'clutch25' },
      { code: 'BADGE_021', name: 'World Tour', description: 'Played 5 different maps.', rarity: 'common', iconKey: 'maps5' },
      { code: 'BADGE_022', name: 'Utility Nerd', description: '5000 utility damage.', rarity: 'rare', iconKey: 'util5000' },
      { code: 'BADGE_023', name: 'Star Player', description: '50 MVP stars.', rarity: 'epic', iconKey: 'mvp50' },
      { code: 'BADGE_024', name: 'Consistent I', description: '10 good ADR games.', rarity: 'uncommon', iconKey: 'adr10' },
      { code: 'BADGE_025', name: 'Consistent II', description: '25 good ADR games.', rarity: 'rare', iconKey: 'adr25' },
      { code: 'BADGE_026', name: 'No-Life', description: 'Active all week.', rarity: 'rare', iconKey: 'week_active' },
      { code: 'BADGE_027', name: 'Forum Addict', description: '50 forum posts.', rarity: 'uncommon', iconKey: 'forum50' },
      { code: 'BADGE_028', name: 'Liked Voice', description: '50 upvotes.', rarity: 'rare', iconKey: 'upvotes50' },
      { code: 'BADGE_029', name: 'Party Leader', description: 'Led 15 party matches.', rarity: 'uncommon', iconKey: 'party_leader' },
      { code: 'BADGE_030', name: 'Social King', description: '20 friends.', rarity: 'rare', iconKey: 'friends20' },
      { code: 'BADGE_031', name: 'Collector I', description: 'Own 10 cosmetics.', rarity: 'common', iconKey: 'collect10' },
      { code: 'BADGE_032', name: 'Collector II', description: 'Own 25 cosmetics.', rarity: 'uncommon', iconKey: 'collect25' },
      { code: 'BADGE_033', name: 'Collector III', description: 'Own 50 cosmetics.', rarity: 'rare', iconKey: 'collect50' },
      { code: 'BADGE_034', name: 'Drip Check', description: 'Wear rare+ cosmetic.', rarity: 'rare', iconKey: 'drip_check' },
      { code: 'BADGE_035', name: 'Full Set', description: 'Completed a set.', rarity: 'epic', iconKey: 'full_set' },
      { code: 'BADGE_036', name: 'Loot Goblin', description: 'Opened 20 lootboxes.', rarity: 'uncommon', iconKey: 'loot20' },
      { code: 'BADGE_037', name: 'Lucky Pull', description: 'Got a legendary drop.', rarity: 'legendary', iconKey: 'leg_drop' },
      { code: 'BADGE_038', name: 'Star Touched', description: 'Got a celestial drop.', rarity: 'celestial', iconKey: 'celestial_drop' },
      { code: 'BADGE_039', name: 'Fashion King', description: 'Legendary loadout.', rarity: 'legendary', iconKey: 'fashion_king' },
      { code: 'BADGE_040', name: 'Perfect Week', description: 'Win daily for a week.', rarity: 'epic', iconKey: 'perfect_week' },
      { code: 'BADGE_041', name: 'Tilt-Proof', description: 'Queued after 5 losses.', rarity: 'rare', iconKey: 'tilt_proof' },
      { code: 'BADGE_042', name: 'Comeback Season', description: 'Recovered after tilt.', rarity: 'epic', iconKey: 'comeback_season' },
      { code: 'BADGE_043', name: 'Gentle Giant', description: 'Zero reports streak.', rarity: 'rare', iconKey: 'gentle_giant' },
      { code: 'BADGE_044', name: 'Team Captain', description: 'Led 15 full stacks.', rarity: 'epic', iconKey: 'team_captain' },
      { code: 'BADGE_045', name: 'Insider', description: 'Played insider events.', rarity: 'epic', iconKey: 'insider' },
      { code: 'BADGE_046', name: 'Event Hunter', description: 'Completed 5 events.', rarity: 'epic', iconKey: 'event_hunter' },
      { code: 'BADGE_047', name: 'Top 100', description: 'Top 100 leaderboard.', rarity: 'epic', iconKey: 'top100' },
      { code: 'BADGE_048', name: 'Top 10', description: 'Top 10 leaderboard.', rarity: 'legendary', iconKey: 'top10' },
      { code: 'BADGE_049', name: 'Number One', description: '#1 on leaderboard.', rarity: 'celestial', iconKey: 'number_one' },
      { code: 'BADGE_050', name: 'Day One OG', description: 'Played Season 1.', rarity: 'legendary', iconKey: 'day_one_og' },
    ];

    for (const badge of BADGES) {
      try {
        await sql`
          INSERT INTO badges (code, name, description, rarity, icon_key, is_active)
          VALUES (${badge.code}, ${badge.name}, ${badge.description}, ${badge.rarity}, ${badge.iconKey}, true)
          ON CONFLICT (code) DO NOTHING
        `;
      } catch (e) {
        console.log(`  ⚠️ Skipped ${badge.code}`);
      }
    }

    const result = await sql`SELECT COUNT(*) as count FROM badges`;
    console.log(`✅ Badges seeded: ${result[0].count} total\n`);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await seedMissions();
    await seedAchievements();
    await seedBadges();
    console.log('✅✅✅ ALL SEEDING COMPLETE!\n');
    console.log('Summary:');
    console.log('  - 55 missions seeded');
    console.log('  - 50 achievements seeded');
    console.log('  - 50 badges seeded');
    console.log('  - Total: 155 items\n');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
