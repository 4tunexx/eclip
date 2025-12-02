import { RankTier, Match, User } from './types';

export const MOCK_USER: User = {
  id: 'u_123456',
  username: 'karrigan_fan',
  email: 'player@eclip.pro',
  avatarUrl: 'https://picsum.photos/seed/karrigan_fan/200',
  level: 42,
  xp: 850,
  xpToNextLevel: 1000,
  rank: RankTier.DIAMOND,
  mmr: 1850,
  coins: 125.50,
  isVerified: true,
  isSteamLinked: true,
};

export const RECENT_MATCHES: Match[] = [
  { id: 'm_1', map: 'de_mirage', score: '13 - 9', result: 'WIN', date: '2 hours ago', kda: '24/15/5', hsPercentage: 62, adr: 95 },
  { id: 'm_2', map: 'de_anubis', score: '11 - 13', result: 'LOSS', date: '5 hours ago', kda: '18/19/4', hsPercentage: 45, adr: 72 },
  { id: 'm_3', map: 'de_nuke', score: '13 - 5', result: 'WIN', date: '1 day ago', kda: '32/10/2', hsPercentage: 78, adr: 110 },
  { id: 'm_4', map: 'de_inferno', score: '13 - 11', result: 'WIN', date: '1 day ago', kda: '21/18/8', hsPercentage: 55, adr: 88 },
];

export const MAP_POOL = [
  { name: 'Mirage', image: 'https://picsum.photos/seed/mirage/400/200' },
  { name: 'Inferno', image: 'https://picsum.photos/seed/inferno/400/200' },
  { name: 'Nuke', image: 'https://picsum.photos/seed/nuke/400/200' },
  { name: 'Overpass', image: 'https://picsum.photos/seed/overpass/400/200' },
  { name: 'Vertigo', image: 'https://picsum.photos/seed/vertigo/400/200' },
  { name: 'Ancient', image: 'https://picsum.photos/seed/ancient/400/200' },
  { name: 'Anubis', image: 'https://picsum.photos/seed/anubis/400/200' },
];

// Anti-Cheat Events Simulation
export const AC_LOGS = [
  { time: '10:42:05', event: 'Driver integrity verified', type: 'info' },
  { time: '10:42:01', event: 'Connection established to AC Relay #EU-West', type: 'success' },
  { time: '10:41:55', event: 'Scanning background processes...', type: 'info' },
  { time: '10:41:50', event: 'EclipAC Client v2.4.1 initialized', type: 'info' },
];