export enum RankTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond',
  ELITE = 'Elite',
  MASTER = 'Master',
  IMMORTAL = 'Immortal'
}

export enum MatchStatus {
  PENDING = 'PENDING',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED'
}

export enum QueueState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ACCEPTED = 'ACCEPTED',
  IN_GAME = 'IN_GAME'
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: RankTier;
  mmr: number;
  coins: number;
  isVerified: boolean;
  isSteamLinked: boolean;
}

export interface Match {
  id: string;
  map: string;
  score: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  date: string;
  kda: string;
  hsPercentage: number;
  adr: number;
}

export interface AntiCheatStatus {
  isConnected: boolean;
  lastHeartbeat: number; // timestamp
  version: string;
  integrityCheck: 'PASSED' | 'FAILED' | 'CHECKING' | 'UNKNOWN';
  driverStatus: 'ACTIVE' | 'INACTIVE';
}
