/**
 * REQUIREMENT TYPES FOR ADMIN PANEL
 * Standardized values that admins can select when creating missions, achievements, badges, and ranks
 */

// MISSION REQUIREMENT TYPES
export const MISSION_REQUIREMENT_TYPES = {
  KILLS: { value: 'KILLS', label: 'Kills', unit: 'kills' },
  DEATHS: { value: 'DEATHS', label: 'Deaths Allowed', unit: 'deaths' },
  ASSISTS: { value: 'ASSISTS', label: 'Assists', unit: 'assists' },
  HEADSHOTS: { value: 'HEADSHOTS', label: 'Headshots', unit: 'headshots' },
  WINS: { value: 'WINS', label: 'Wins', unit: 'matches' },
  MATCHES_PLAYED: { value: 'MATCHES_PLAYED', label: 'Matches Played', unit: 'matches' },
  BOMB_PLANTS: { value: 'BOMB_PLANTS', label: 'Bomb Plants', unit: 'plants' },
  BOMB_DEFUSES: { value: 'BOMB_DEFUSES', label: 'Bomb Defuses', unit: 'defuses' },
  CLUTCHES_WON: { value: 'CLUTCHES_WON', label: 'Clutches Won', unit: 'clutches' },
  MVP_EARNED: { value: 'MVP_EARNED', label: 'MVP Earned', unit: 'times' },
  CONSECUTIVE_WINS: { value: 'CONSECUTIVE_WINS', label: 'Consecutive Wins', unit: 'matches' },
  OBJECTIVE_ROUNDS: { value: 'OBJECTIVE_ROUNDS', label: 'Objective Rounds', unit: 'rounds' },
  DAMAGE_DEALT: { value: 'DAMAGE_DEALT', label: 'Damage Dealt', unit: 'damage' },
  MONEY_EARNED: { value: 'MONEY_EARNED', label: 'Money Earned', unit: 'amount' },
  ROUNDS_PLAYED: { value: 'ROUNDS_PLAYED', label: 'Rounds Played', unit: 'rounds' },
  TIMESPAN_DAYS: { value: 'TIMESPAN_DAYS', label: 'Timespan (Days)', unit: 'days' },
  DAILY_LOGIN: { value: 'DAILY_LOGIN', label: 'Daily Login', unit: 'logins' },
} as const;

export const MISSION_REQUIREMENT_TYPE_OPTIONS = Object.values(MISSION_REQUIREMENT_TYPES).map(
  (type) => ({
    value: type.value,
    label: type.label,
  })
);

// ACHIEVEMENT REQUIREMENT TYPES
export const ACHIEVEMENT_REQUIREMENT_TYPES = {
  LEVEL_REACH: { value: 'LEVEL_REACH', label: 'Level Reach', unit: 'level' },
  ESR_REACH: { value: 'ESR_REACH', label: 'ESR Tier Reach', unit: 'ESR' },
  KILL_MILESTONE: { value: 'KILL_MILESTONE', label: 'Kill Milestone', unit: 'kills' },
  WIN_STREAK: { value: 'WIN_STREAK', label: 'Win Streak', unit: 'matches' },
  MATCH_COUNT: { value: 'MATCH_COUNT', label: 'Match Count', unit: 'matches' },
  MVP_COUNT: { value: 'MVP_COUNT', label: 'MVP Count', unit: 'times' },
  HEADSHOT_PERCENTAGE: { value: 'HEADSHOT_PERCENTAGE', label: 'Headshot %', unit: '%' },
  CLUTCH_SUCCESS: { value: 'CLUTCH_SUCCESS', label: 'Clutch Success', unit: 'clutches' },
  DAMAGE_MILESTONE: { value: 'DAMAGE_MILESTONE', label: 'Damage Milestone', unit: 'damage' },
  PLAYTIME_HOURS: { value: 'PLAYTIME_HOURS', label: 'Playtime Hours', unit: 'hours' },
  SOCIAL_FRIENDS: { value: 'SOCIAL_FRIENDS', label: 'Friends Added', unit: 'friends' },
  FORUM_POSTS: { value: 'FORUM_POSTS', label: 'Forum Posts', unit: 'posts' },
  ACHIEVEMENT_COLLECTOR: { value: 'ACHIEVEMENT_COLLECTOR', label: 'Achievement Collector', unit: 'achievements' },
  BADGE_COLLECTOR: { value: 'BADGE_COLLECTOR', label: 'Badge Collector', unit: 'badges' },
  COMMUNITY_CONTRIBUTOR: { value: 'COMMUNITY_CONTRIBUTOR', label: 'Community Contributor', unit: 'points' },
  TOURNAMENT_PLACED: { value: 'TOURNAMENT_PLACED', label: 'Tournament Placed', unit: 'placement' },
} as const;

export const ACHIEVEMENT_REQUIREMENT_TYPE_OPTIONS = Object.values(
  ACHIEVEMENT_REQUIREMENT_TYPES
).map((type) => ({
  value: type.value,
  label: type.label,
}));

// BADGE REQUIREMENT TYPES
export const BADGE_REQUIREMENT_TYPES = {
  ACHIEVEMENT_UNLOCK: { value: 'ACHIEVEMENT_UNLOCK', label: 'Unlock Achievement', unit: 'achievement_id' },
  BATTLE_PASS_TIER: { value: 'BATTLE_PASS_TIER', label: 'Battle Pass Tier', unit: 'tier' },
  PURCHASE_COSMETIC: { value: 'PURCHASE_COSMETIC', label: 'Purchase Cosmetic', unit: 'cosmetic_id' },
  SEASONAL_RANK: { value: 'SEASONAL_RANK', label: 'Seasonal Rank', unit: 'rank' },
  TOURNAMENT_VICTORY: { value: 'TOURNAMENT_VICTORY', label: 'Tournament Victory', unit: 'tournament_id' },
  REFERRAL_COUNT: { value: 'REFERRAL_COUNT', label: 'Referral Count', unit: 'referrals' },
} as const;

export const BADGE_REQUIREMENT_TYPE_OPTIONS = Object.values(BADGE_REQUIREMENT_TYPES).map(
  (type) => ({
    value: type.value,
    label: type.label,
  })
);

// RANK/ESR TIER REQUIREMENT TYPES
export const RANK_REQUIREMENT_TYPES = {
  ESR_MINIMUM: { value: 'ESR_MINIMUM', label: 'ESR Minimum', unit: 'ESR' },
  ESR_MAXIMUM: { value: 'ESR_MAXIMUM', label: 'ESR Maximum', unit: 'ESR' },
  DIVISION_POINT: { value: 'DIVISION_POINT', label: 'Division Boundary', unit: 'ESR' },
} as const;

export const RANK_REQUIREMENT_TYPE_OPTIONS = Object.values(RANK_REQUIREMENT_TYPES).map(
  (type) => ({
    value: type.value,
    label: type.label,
  })
);

// ESR TIER LABELS FOR ACHIEVEMENTS
export const ESR_TIERS = [
  'Beginner I',
  'Beginner II',
  'Beginner III',
  'Rookie I',
  'Rookie II',
  'Rookie III',
  'Pro I',
  'Pro II',
  'Pro III',
  'Ace I',
  'Ace II',
  'Ace III',
  'Legend I',
  'Legend II',
  'Legend III',
] as const;

// Helper function to get requirement type details
export function getRequirementTypeInfo(
  type: string,
  category?: 'mission' | 'achievement' | 'badge' | 'rank'
) {
  const allTypes = {
    ...MISSION_REQUIREMENT_TYPES,
    ...ACHIEVEMENT_REQUIREMENT_TYPES,
    ...BADGE_REQUIREMENT_TYPES,
    ...RANK_REQUIREMENT_TYPES,
  };

  return allTypes[type as keyof typeof allTypes] || null;
}
