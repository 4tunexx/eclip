/**
 * ESR Rank Calculator
 * Calculates player rank tier and division based on ESR value
 * Using real ranks from database: Beginner, Rookie, Pro, Ace, Legend
 */

export interface RankInfo {
  tier: 'Beginner' | 'Rookie' | 'Pro' | 'Ace' | 'Legend';
  division: 1 | 2 | 3;
  color: string;
  esrRequired: number;
}

// Real ESR thresholds from database
const TIER_RANGES: Record<string, { color: string; ranges: Array<[number, number]> }> = {
  Beginner: {
    color: '#808080',
    ranges: [
      [0, 166],
      [167, 333],
      [334, 500],
    ],
  },
  Rookie: {
    color: '#90EE90',
    ranges: [
      [500, 666],
      [667, 833],
      [834, 1000],
    ],
  },
  Pro: {
    color: '#4169E1',
    ranges: [
      [1000, 1333],
      [1334, 1666],
      [1667, 2000],
    ],
  },
  Ace: {
    color: '#FFD700',
    ranges: [
      [2000, 2500],
      [2501, 3000],
      [3001, 3500],
    ],
  },
  Legend: {
    color: '#FF1493',
    ranges: [
      [3500, 4000],
      [4001, 4500],
      [4501, 5000],
    ],
  },
};

export function getRankFromESR(esr: number): RankInfo {
  const esrValue = Math.max(0, Math.min(5000, esr)); // Clamp between 0-5000

  for (const [tierName, tierData] of Object.entries(TIER_RANGES)) {
    for (let divisionIndex = 0; divisionIndex < tierData.ranges.length; divisionIndex++) {
      const [min, max] = tierData.ranges[divisionIndex];
      if (esrValue >= min && esrValue <= max) {
        return {
          tier: tierName as 'Beginner' | 'Rookie' | 'Pro' | 'Ace' | 'Legend',
          division: (divisionIndex + 1) as 1 | 2 | 3,
          color: tierData.color,
          esrRequired: esrValue,
        };
      }
    }
  }

  // Fallback to Legend Division 3 (highest)
  return {
    tier: 'Legend',
    division: 3,
    color: '#FF1493',
    esrRequired: esrValue,
  };
}

export function getRankTierColor(tier: string): string {
  const tierData = TIER_RANGES[tier];
  return tierData?.color || '#808080';
}

export function formatRank(esr: number): string {
  const rankInfo = getRankFromESR(esr);
  return `${rankInfo.tier} ${rankInfo.division}`;
}

/**
 * Get ESR range for current rank
 */
export function getESRRangeForRank(tier: string, division: number): [number, number] {
  const tierData = TIER_RANGES[tier];
  if (!tierData || division < 1 || division > 3) {
    return [0, 500];
  }
  return tierData.ranges[division - 1];
}

/**
 * Calculate progress to next division
 */
export function getProgressToNextDivision(esr: number): { current: number; next: number; percentage: number } {
  const rankInfo = getRankFromESR(esr);
  const [currentMin, currentMax] = getESRRangeForRank(rankInfo.tier, rankInfo.division);

  // Progress within current division
  const progressInDiv = esr - currentMin;
  const rangeSize = currentMax - currentMin;
  const percentage = Math.min(100, Math.max(0, (progressInDiv / rangeSize) * 100));

  return {
    current: esr,
    next: currentMax,
    percentage,
  };
}
