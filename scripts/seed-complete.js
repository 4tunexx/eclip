import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function seed() {
  try {
    console.log('🚀 Starting fresh seeding...\n');
    
    // Clear
    await sql`DELETE FROM achievements`;
    await sql`DELETE FROM badges`;
    console.log('✅ Cleared old data\n');
    
    // Seed 50 achievements
    console.log('📊 Seeding 50 achievements...');
    const achs = [
      ['ACHV_001', 'Welcome to Eclip', 'Create your account and log in for the first time.', 'platform', 'account_created', null, 1, 100, false],
      ['ACHV_002', 'Verified', 'Verify your email address.', 'platform', 'verify_email', null, 1, 150, false],
      ['ACHV_003', 'Linked Up', 'Connect your Steam account.', 'platform', 'verify_steam', null, 1, 150, false],
      ['ACHV_004', 'Level 5', 'Reach profile level 5.', 'progression', 'reach_level', '5', 5, 300, false],
      ['ACHV_005', 'Level 10', 'Reach profile level 10.', 'progression', 'reach_level', '10', 10, 500, false],
      ['ACHV_006', 'Level 20', 'Reach profile level 20.', 'progression', 'reach_level', '20', 20, 800, false],
      ['ACHV_007', 'ESR 1000', 'Reach 1000 ESR.', 'progression', 'reach_esr', '1000', 1000, 500, false],
      ['ACHV_008', 'ESR 1500', 'Reach 1500 ESR.', 'progression', 'reach_esr', '1500', 1500, 800, false],
      ['ACHV_009', 'ESR 2000', 'Reach 2000 ESR.', 'progression', 'reach_esr', '2000', 2000, 1200, false],
      ['ACHV_010', 'ESR 2500', 'Reach 2500 ESR.', 'progression', 'reach_esr', '2500', 2500, 1500, false],
      ['ACHV_011', 'Match Veteran I', 'Play 50 matches.', 'cs2', 'matches_total', null, 50, 600, false],
      ['ACHV_012', 'Match Veteran II', 'Play 150 matches.', 'cs2', 'matches_total', null, 150, 1200, false],
      ['ACHV_013', 'Match Veteran III', 'Play 300 matches.', 'cs2', 'matches_total', null, 300, 1800, false],
      ['ACHV_014', 'Win Collector I', 'Win 25 matches.', 'cs2', 'wins_total', null, 25, 600, false],
      ['ACHV_015', 'Win Collector II', 'Win 75 matches.', 'cs2', 'wins_total', null, 75, 1200, false],
      ['ACHV_016', 'Win Collector III', 'Win 150 matches.', 'cs2', 'wins_total', null, 150, 2000, false],
      ['ACHV_017', 'Headshot Enjoyer I', 'Get 200 headshot kills.', 'cs2', 'hs_kills', null, 200, 800, false],
      ['ACHV_018', 'Headshot Enjoyer II', 'Get 500 headshot kills.', 'cs2', 'hs_kills', null, 500, 1400, false],
      ['ACHV_019', 'Headshot God', 'Get 1000 headshot kills.', 'cs2', 'hs_kills', null, 1000, 2500, false],
      ['ACHV_020', 'Clutch Artist', 'Win 25 clutches.', 'cs2', 'clutches_won', null, 25, 2000, false],
      ['ACHV_021', 'Where We Droppin?', 'Play on 5 different maps.', 'cs2', 'unique_maps_played', null, 5, 700, false],
      ['ACHV_022', 'Utility Nerd', 'Deal 5000 utility damage.', 'cs2', 'utility_damage', null, 5000, 1000, false],
      ['ACHV_023', 'MVP Star', 'Earn 50 MVP stars.', 'cs2', 'mvp_total', null, 50, 1200, false],
      ['ACHV_024', 'Consistency I', 'Finish 10 matches with ADR ≥ 80.', 'cs2', 'matches_adr80_plus', null, 10, 900, false],
      ['ACHV_025', 'Consistency II', 'Finish 25 matches with ADR ≥ 80.', 'cs2', 'matches_adr80_plus', null, 25, 1500, false],
      ['ACHV_026', 'No-Life Grinder', 'Play Eclip on 7 different days in a week.', 'platform', 'active_days_in_week', null, 7, 700, false],
      ['ACHV_027', 'Forum Addict', 'Create 50 forum posts.', 'social', 'forum_posts', null, 50, 800, false],
      ['ACHV_028', 'Liked Voice', 'Receive 50 upvotes on your posts.', 'social', 'forum_upvotes', null, 50, 900, false],
      ['ACHV_029', 'Party Leader', 'Play 20 matches with a party of 3+.', 'social', 'party_matches_played', null, 20, 1000, false],
      ['ACHV_030', 'Social King', 'Have 20 friends on Eclip.', 'social', 'friends_added', null, 20, 1200, false],
      ['ACHV_031', 'Collector I', 'Own 10 cosmetics.', 'cosmetic', 'cosmetics_owned', null, 10, 400, false],
      ['ACHV_032', 'Collector II', 'Own 25 cosmetics.', 'cosmetic', 'cosmetics_owned', null, 25, 800, false],
      ['ACHV_033', 'Collector III', 'Own 50 cosmetics.', 'cosmetic', 'cosmetics_owned', null, 50, 1400, false],
      ['ACHV_034', 'Drip Check', 'Equip a rare or higher cosmetic.', 'cosmetic', 'equip_rarity', 'rare', 1, 500, false],
      ['ACHV_035', 'Full Set', 'Complete any cosmetic set.', 'cosmetic', 'complete_set', null, 1, 1000, false],
      ['ACHV_036', 'Loot Goblin', 'Open 20 lootboxes.', 'cosmetic', 'lootbox_opened', null, 20, 800, false],
      ['ACHV_037', 'Lucky Pull', 'Obtain a legendary cosmetic from a lootbox.', 'cosmetic', 'lootbox_rarity_drop', 'legendary', 1, 1600, true],
      ['ACHV_038', 'Touched by the Stars', 'Obtain a celestial cosmetic.', 'cosmetic', 'lootbox_rarity_drop', 'celestial', 1, 2500, true],
      ['ACHV_039', 'Fashion King', 'Equip legendary frame, banner, and title simultaneously.', 'cosmetic', 'legendary_loadout_equipped', null, 1, 2000, true],
      ['ACHV_040', 'Perfect Week', 'Win at least one match every day for seven days.', 'progression', 'daily_win_streak', null, 7, 1800, false],
      ['ACHV_041', 'Tilt-Proof', 'Lose 5 matches in a row and still queue again.', 'cs2', 'loss_streak_then_queue', null, 1, 600, true],
      ['ACHV_042', 'Comeback Season', 'Recover from a 5-loss streak and then win 3 in a row.', 'cs2', 'comeback_after_loss_streak', null, 1, 1400, true],
      ['ACHV_043', 'Gentle Giant', 'Play 10 matches without receiving a single report.', 'social', 'matches_no_reports', null, 10, 700, false],
      ['ACHV_044', 'Team Captain', 'Lead a full 5-stack party into 15 matches.', 'social', 'party_leader_matches', null, 15, 1200, false],
      ['ACHV_045', 'Insider Vibes', 'Participate in 3 test features or insider events.', 'event', 'insider_events_participated', null, 3, 1000, false],
      ['ACHV_046', 'Event Hunter', 'Complete 5 limited-time event missions.', 'event', 'event_missions_completed', null, 5, 1200, false],
      ['ACHV_047', 'Top 100', 'Reach top 100 on any leaderboard.', 'progression', 'leaderboard_rank_top_n', '100', 1, 2000, false],
      ['ACHV_048', 'Top 10', 'Reach top 10 on any leaderboard.', 'progression', 'leaderboard_rank_top_n', '10', 1, 3000, false],
      ['ACHV_049', 'Leaderboard King', 'Reach rank #1 on any leaderboard.', 'progression', 'leaderboard_rank_top_n', '1', 1, 5000, true],
      ['ACHV_050', 'Day One OG', 'Play during the first official season of Eclip.', 'event', 'season_participation', 'Season1', 1, 1000, false],
    ];
    
    for (const [code, name, desc, cat, reqType, reqVal, target, xp, secret] of achs) {
      await sql`INSERT INTO achievements (code, name, description, category, requirement_type, requirement_value, target, reward_xp, is_secret, is_active, points) 
                VALUES (${code}, ${name}, ${desc}, ${cat}, ${reqType}, ${reqVal}, ${target}, ${xp}, ${secret}, true, ${xp})`;
    }
    console.log('✅ 50 achievements seeded\n');
    
    // Seed 50 badges
    console.log('📊 Seeding 50 badges...');
    const badges = [
      ['Fresh Spawn', 'Created an account.', 'account', 'common', '/badges/fresh_spawn.png'],
      ['Verified', 'Verified email.', 'account', 'common', '/badges/verified.png'],
      ['Linked', 'Linked Steam account.', 'account', 'common', '/badges/linked_steam.png'],
      ['Level 5', 'Reached level 5.', 'progression', 'common', '/badges/level5.png'],
      ['Level 10', 'Reached level 10.', 'progression', 'common', '/badges/level10.png'],
      ['Level 20', 'Reached level 20.', 'progression', 'uncommon', '/badges/level20.png'],
      ['ESR 1000', 'Reached 1000 ESR.', 'ranking', 'uncommon', '/badges/esr1000.png'],
      ['ESR 1500', 'Reached 1500 ESR.', 'ranking', 'rare', '/badges/esr1500.png'],
      ['ESR 2000', 'Reached 2000 ESR.', 'ranking', 'rare', '/badges/esr2000.png'],
      ['ESR 2500', 'Reached 2500 ESR.', 'ranking', 'epic', '/badges/esr2500.png'],
      ['Match Vet I', 'Played 50 matches.', 'gameplay', 'common', '/badges/matches50.png'],
      ['Match Vet II', 'Played 150 matches.', 'gameplay', 'uncommon', '/badges/matches150.png'],
      ['Match Vet III', 'Played 300 matches.', 'gameplay', 'rare', '/badges/matches300.png'],
      ['Winner I', 'Won 25 matches.', 'gameplay', 'common', '/badges/wins25.png'],
      ['Winner II', 'Won 75 matches.', 'gameplay', 'uncommon', '/badges/wins75.png'],
      ['Winner III', 'Won 150 matches.', 'gameplay', 'rare', '/badges/wins150.png'],
      ['HS Enjoyer I', '200 headshots.', 'gameplay', 'common', '/badges/hs200.png'],
      ['HS Enjoyer II', '500 headshots.', 'gameplay', 'uncommon', '/badges/hs500.png'],
      ['HS God', '1000 headshots.', 'gameplay', 'epic', '/badges/hs1000.png'],
      ['Clutch Artist', '25 clutches.', 'gameplay', 'epic', '/badges/clutch25.png'],
      ['World Tour', 'Played 5 different maps.', 'gameplay', 'common', '/badges/maps5.png'],
      ['Utility Nerd', '5000 utility damage.', 'gameplay', 'rare', '/badges/util5000.png'],
      ['Star Player', '50 MVP stars.', 'gameplay', 'epic', '/badges/mvp50.png'],
      ['Consistent I', '10 good ADR games.', 'gameplay', 'uncommon', '/badges/adr10.png'],
      ['Consistent II', '25 good ADR games.', 'gameplay', 'rare', '/badges/adr25.png'],
      ['No-Life', 'Active all week.', 'progression', 'rare', '/badges/week_active.png'],
      ['Forum Addict', '50 forum posts.', 'social', 'uncommon', '/badges/forum50.png'],
      ['Liked Voice', '50 upvotes.', 'social', 'rare', '/badges/upvotes50.png'],
      ['Party Leader', 'Led 15 party matches.', 'social', 'uncommon', '/badges/party_leader.png'],
      ['Social King', '20 friends.', 'social', 'rare', '/badges/friends20.png'],
      ['Collector I', 'Own 10 cosmetics.', 'cosmetic', 'common', '/badges/collect10.png'],
      ['Collector II', 'Own 25 cosmetics.', 'cosmetic', 'uncommon', '/badges/collect25.png'],
      ['Collector III', 'Own 50 cosmetics.', 'cosmetic', 'rare', '/badges/collect50.png'],
      ['Drip Check', 'Wear rare+ cosmetic.', 'cosmetic', 'rare', '/badges/drip_check.png'],
      ['Full Set', 'Completed a set.', 'cosmetic', 'epic', '/badges/full_set.png'],
      ['Loot Goblin', 'Opened 20 lootboxes.', 'cosmetic', 'uncommon', '/badges/loot20.png'],
      ['Lucky Pull', 'Got a legendary drop.', 'cosmetic', 'legendary', '/badges/leg_drop.png'],
      ['Star Touched', 'Got a celestial drop.', 'cosmetic', 'celestial', '/badges/celestial_drop.png'],
      ['Fashion King', 'Legendary loadout.', 'cosmetic', 'legendary', '/badges/fashion_king.png'],
      ['Perfect Week', 'Win daily for a week.', 'achievement', 'epic', '/badges/perfect_week.png'],
      ['Tilt-Proof', 'Queued after 5 losses.', 'achievement', 'rare', '/badges/tilt_proof.png'],
      ['Comeback Season', 'Recovered after tilt.', 'achievement', 'epic', '/badges/comeback_season.png'],
      ['Gentle Giant', 'Zero reports streak.', 'social', 'rare', '/badges/gentle_giant.png'],
      ['Team Captain', 'Led 15 full stacks.', 'social', 'epic', '/badges/team_captain.png'],
      ['Insider', 'Played insider events.', 'event', 'epic', '/badges/insider.png'],
      ['Event Hunter', 'Completed 5 events.', 'event', 'epic', '/badges/event_hunter.png'],
      ['Top 100', 'Top 100 leaderboard.', 'ranking', 'epic', '/badges/top100.png'],
      ['Top 10', 'Top 10 leaderboard.', 'ranking', 'legendary', '/badges/top10.png'],
      ['Number One', '#1 on leaderboard.', 'ranking', 'celestial', '/badges/number_one.png'],
      ['Day One OG', 'Played Season 1.', 'event', 'legendary', '/badges/day_one_og.png'],
    ];
    
    for (const [name, desc, cat, rarity, imgUrl] of badges) {
      await sql`INSERT INTO badges (name, description, category, rarity, image_url, unlock_type) 
                VALUES (${name}, ${desc}, ${cat}, ${rarity}, ${imgUrl}, 'achievement')`;
    }
    console.log('✅ 50 badges seeded\n');
    
    // Final count
    const ac = await sql`SELECT COUNT(*) as c FROM achievements`;
    const bc = await sql`SELECT COUNT(*) as c FROM badges`;
    const mc = await sql`SELECT COUNT(*) as c FROM missions`;
    
    console.log('✅✅✅ SEEDING COMPLETE!\n');
    console.log('📊 Final Summary:');
    console.log(`  ✅ Missions: ${mc[0].c}/55`);
    console.log(`  ✅ Achievements: ${ac[0].c}/50`);
    console.log(`  ✅ Badges: ${bc[0].c}/50`);
    console.log(`  🎯 TOTAL: ${mc[0].c + ac[0].c + bc[0].c}/155\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
