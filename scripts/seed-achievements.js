import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

const ACHIEVEMENTS = [
  // LEVEL ACHIEVEMENTS (5)
  { code: 'LVL_10', name: 'Level 10', description: 'Reach level 10', points: 100 },
  { code: 'LVL_25', name: 'Level 25', description: 'Reach level 25', points: 250 },
  { code: 'LVL_50', name: 'Level 50', description: 'Reach level 50', points: 500 },
  { code: 'LVL_75', name: 'Level 75', description: 'Reach level 75', points: 750 },
  { code: 'LVL_MAX', name: 'Max Level', description: 'Reach level 100', points: 1000 },

  // ESR ACHIEVEMENTS (4)
  { code: 'ESR_ROOKIE', name: 'Rising Star', description: 'Reach Rookie rank (400 ESR)', points: 200 },
  { code: 'ESR_PRO', name: 'Professional', description: 'Reach Pro rank (800 ESR)', points: 400 },
  { code: 'ESR_ACE', name: 'Ace Status', description: 'Reach Ace rank (1500 ESR)', points: 600 },
  { code: 'ESR_LEGEND', name: 'Legend', description: 'Reach Legend rank (2200 ESR)', points: 1000 },

  // COMBAT ACHIEVEMENTS (12)
  { code: 'FIRST_KILL', name: 'First Blood', description: 'Get your first kill', points: 50 },
  { code: 'HS_100', name: 'Headshot Master', description: 'Get 100 headshots', points: 300 },
  { code: 'KILLSTREAK_10', name: 'Kill Streak', description: 'Get a 10 kill streak', points: 200 },
  { code: 'CLUTCH_10', name: 'Clutch Master', description: 'Win 10 clutch rounds', points: 350 },
  { code: 'ACE_5', name: 'Ace Hunter', description: 'Get 5 ace rounds', points: 400 },
  { code: 'ENTRY_50', name: 'Entry Fragger', description: 'Get 50 opening kills', points: 250 },
  { code: 'MVP_50', name: 'MVP Elite', description: 'Get 50 MVP awards', points: 350 },
  { code: 'BOMB_PLANT_50', name: 'Demolition Expert', description: 'Plant 50 bombs', points: 200 },
  { code: 'BOMB_DEFUSE_50', name: 'Bomb Defuser', description: 'Defuse 50 bombs', points: 200 },
  { code: 'SILENT_ASSASSIN', name: 'Silent Assassin', description: 'Get 25 no-death kills', points: 300 },
  { code: 'ASSIST_100', name: 'Tactical Genius', description: 'Get 100 assists', points: 250 },
  { code: 'PISTOL_25', name: 'Pistol Specialist', description: 'Win 25 pistol rounds', points: 200 },

  // SOCIAL ACHIEVEMENTS (8)
  { code: 'TEAM_JOIN', name: 'Team Player', description: 'Join a team', points: 100 },
  { code: 'FRIEND_10', name: 'Socialite', description: 'Add 10 friends', points: 150 },
  { code: 'FRIEND_50', name: 'Popular', description: 'Reach 50 friends', points: 300 },
  { code: 'FORUM_20', name: 'Forum Veteran', description: 'Create 20 forum posts', points: 200 },
  { code: 'CHAT_500', name: 'Chat Master', description: 'Send 500 chat messages', points: 250 },
  { code: 'TOURNAMENT_WIN', name: 'Tournament Champion', description: 'Win a tournament', points: 500 },
  { code: 'DUO_50', name: 'Duo Master', description: 'Play 50 matches together', points: 350 },
  { code: 'SQUAD_LEAD', name: 'Squad Leader', description: 'Lead squad to 5 wins', points: 400 },

  // PLATFORM ACHIEVEMENTS (10)
  { code: 'PROFILE_COMPLETE', name: 'Profile Perfectionist', description: 'Complete your profile', points: 100 },
  { code: 'LOGIN_7DAY', name: 'Streaker', description: 'Maintain 7-day login streak', points: 200 },
  { code: 'DAILY_50', name: 'Daily Grind', description: 'Complete 50 daily missions', points: 500 },
  { code: 'COSMETIC_10', name: 'Collector', description: 'Unlock 10 cosmetics', points: 200 },
  { code: 'COSMETIC_25', name: 'Fashion Forward', description: 'Unlock 25 cosmetics', points: 400 },
  { code: 'LEADERBOARD_100', name: 'Leaderboard Star', description: 'Rank top 100', points: 300 },
  { code: 'FIRST_COSMETIC', name: 'First Cosmetic', description: 'Purchase first cosmetic', points: 100 },
  { code: 'COSMETIC_SPENDER', name: 'Cosmetic Collector', description: 'Spend 1000 coins', points: 300 },
  { code: 'VIP_MEMBER', name: 'VIP Status', description: 'Achieve VIP status', points: 250 },
  { code: 'VIP_30DAY', name: 'VIP Loyalist', description: 'VIP for 30 days', points: 400 },

  // COMMUNITY ACHIEVEMENTS (6)
  { code: 'CLIP_SHARE', name: 'Content Creator', description: 'Share your first clip', points: 150 },
  { code: 'CLIP_POPULAR', name: 'Popular Creator', description: 'Get 1000 clip views', points: 300 },
  { code: 'HELP_PLAYERS', name: 'Helper', description: 'Help 5 new players', points: 200 },
  { code: 'AMBASSADOR', name: 'Ambassador', description: 'Invite 10 friends', points: 250 },
  { code: 'REPORTER', name: 'Reporter', description: 'Submit 5 reports', points: 150 },
  { code: 'COMMUNITY_1000', name: 'Community Champion', description: 'Earn 1000 community points', points: 500 },
];

async function seedAchievements() {
  try {
    console.log('🚀 Starting achievement seeding...');

    // Insert achievements
    for (const achievement of ACHIEVEMENTS) {
      try {
        await sql`
          INSERT INTO achievements (id, code, name, description, points)
          VALUES (${uuidv4()}, ${achievement.code}, ${achievement.name}, ${achievement.description}, ${achievement.points})
          ON CONFLICT (code) DO NOTHING
        `;
      } catch (e) {
        console.log(`  ⚠️ Skipped ${achievement.code} (may exist)`);
      }
    }

    console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`);

    // Get total count
    const result = await sql`SELECT COUNT(*) as count FROM achievements`;
    console.log(`📊 Total achievements in database: ${result[0].count}`);

    console.log('✅✅✅ ACHIEVEMENT SEEDING COMPLETE!');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedAchievements();
