import type { User, Match, Player, NewsArticle, ForumActivity, Cosmetic, Mission, Achievement, ForumCategory, ForumThread } from '@/lib/types';
import { Gamepad2, Trophy, BarChart, MessageSquare, Video } from 'lucide-react';

export const topPlayers: Player[] = [
  { id: '1', username: 'Zythex', steamId: '76561197960265728', avatarUrl: 'https://picsum.photos/seed/avatar1/200/200', rank: 'Immortal', mmr: 3200, equippedFrame: 'https://i.postimg.cc/PqYp5d7C/frame-legendary.png' },
  { id: '2', username: 'Vortex', steamId: '76561197960265729', avatarUrl: 'https://picsum.photos/seed/avatar2/200/200', rank: 'Immortal', mmr: 3150 },
  { id: '3', username: 'Crimson', steamId: '76561197960265730', avatarUrl: 'https://picsum.photos/seed/avatar3/200/200', rank: 'Grandmaster', mmr: 2980 },
  { id: '4', username: 'Pulse', steamId: '76561197960265731', avatarUrl: 'https://picsum.photos/seed/avatar4/200/200', rank: 'Grandmaster', mmr: 2950 },
  { id: '5', username: 'Shade', steamId: '76561197960265732', avatarUrl: 'https://picsum.photos/seed/avatar5/200/200', rank: 'Master', mmr: 2800 },
];

export const currentUser: User = {
  id: 'current_user',
  username: 'n3o',
  avatarUrl: 'https://picsum.photos/seed/main-user/200/200',
  level: 42,
  xp: 1250,
  rank: 'Diamond I',
  mmr: 1850,
  coins: 1337.42,
  isAdmin: true,
  equippedFrame: 'https://i.postimg.cc/PqYp5d7C/frame-legendary.png',
  equippedBanner: 'https://i.postimg.cc/tJ5gST8z/banner-animated.gif',
  title: 'Headshot Machine'
};

export const recentMatches: Match[] = [
    {
        id: 'm1',
        map: 'Mirage',
        mapImageUrl: 'https://i.postimg.cc/zXkQzY8J/mirage.png',
        score: '13-8',
        result: 'Win',
        date: '2 hours ago',
        players: [
            { id: '1', steamId: '76561197960265733', username: 'n3o', avatarUrl: 'https://picsum.photos/seed/p1/200/200', rank: 'Diamond I', mmr: 1850, kills: 24, deaths: 15, assists: 5, hsPercentage: 62, mvps: 4, adr: 98.5 },
            { id: '2', steamId: '76561197960265734', username: 'Shadow', avatarUrl: 'https://picsum.photos/seed/p2/200/200', rank: 'Platinum II', mmr: 1600, kills: 18, deaths: 16, assists: 3, hsPercentage: 45, mvps: 2, adr: 75.1 },
        ]
    },
    {
        id: 'm2',
        map: 'Inferno',
        mapImageUrl: 'https://i.postimg.cc/mD3wS2vP/inferno.png',
        score: '10-13',
        result: 'Loss',
        date: '5 hours ago',
        players: [
            { id: '1', steamId: '76561197960265733', username: 'n3o', avatarUrl: 'https://picsum.photos/seed/p1/200/200', rank: 'Diamond I', mmr: 1850, kills: 19, deaths: 20, assists: 2, hsPercentage: 55, mvps: 2, adr: 82.3 },
            { id: '3', steamId: '76561197960265735', username: 'Ghost', avatarUrl: 'https://picsum.photos/seed/p3/200/200', rank: 'Diamond III', mmr: 1950, kills: 28, deaths: 15, assists: 6, hsPercentage: 71, mvps: 5, adr: 110.7 },
        ]
    },
    {
        id: 'm3',
        map: 'Anubis',
        mapImageUrl: 'https://i.postimg.cc/pT3YyT3g/anubis.png',
        score: '13-5',
        result: 'Win',
        date: '1 day ago',
        players: [
            { id: '1', steamId: '76561197960265733', username: 'n3o', avatarUrl: 'https://picsum.photos/seed/p1/200/200', rank: 'Platinum IV', mmr: 1780, kills: 28, deaths: 10, assists: 4, hsPercentage: 68, mvps: 6, adr: 115.2 },
            { id: '4', steamId: '76561197960265736', username: 'Reaper', avatarUrl: 'https://picsum.photos/seed/p4/200/200', rank: 'Gold III', mmr: 1300, kills: 12, deaths: 18, assists: 1, hsPercentage: 30, mvps: 1, adr: 60.9 },
        ]
    }
];

export const dailyMissions: Mission[] = [
    { id: 'd1', title: 'Play 2 Matches', progress: 1, total: 2, reward: '50 XP' },
    { id: 'd2', title: 'Get 30 Kills', progress: 24, total: 30, reward: '0.05 Coins' },
    { id: 'd3', title: 'Win 1 Match on Mirage', progress: 0, total: 1, reward: '25 XP' },
];

export const weeklyMissions: Mission[] = [
    { id: 'w1', title: 'Win 10 Matches', progress: 7, total: 10, reward: '250 XP' },
    { id: 'w2', title: 'Get 50 Headshots', progress: 42, total: 50, reward: '0.25 Coins' },
    { id: 'w3', title: 'Plant the bomb 5 times', progress: 2, total: 5, reward: '100 XP' },
];

export const achievements: Achievement[] = [
    { id: 'a1', title: 'First Victory', description: 'Win your first match.', unlocked: true },
    { id: 'a2', title: 'Centurion', description: 'Win 100 matches.', unlocked: false },
    { id: 'a3', title: 'Ace', description: 'Get 5 kills in a single round.', unlocked: true },
    { id: 'a4', title: 'Sharpshooter', description: 'Achieve 70% headshot rate in a match.', unlocked: false },
    { id: 'a5', title: 'High Roller', description: 'Reach Elite rank.', unlocked: false },
    { id: 'a6', title: 'Collector', description: 'Own 10 cosmetic items.', unlocked: true },
];

export const newsArticles: NewsArticle[] = [
    { 
        id: 'n1', 
        title: 'New Season "Apex" is Live!', 
        excerpt: 'Climb the ranks and earn exclusive rewards in our most competitive season yet.',
        date: '2 days ago',
        icon: Trophy,
    },
    { 
        id: 'n2', 
        title: 'Gameplay Update v1.3.2 - Agent & Map Pool Changes', 
        excerpt: 'Read about the latest balance adjustments and the updated competitive map rotation.',
        date: '4 days ago',
        icon: Gamepad2,
    },
    { 
        id: 'n3', 
        title: 'Community Spotlight: MMR Distribution Analysis',
        excerpt: 'A deep dive into the player skill ratings from last season. Where do you stand?',
        date: '1 week ago',
        icon: BarChart,
    },
];

export const forumActivity: ForumActivity[] = [
    { 
        id: 'f1', 
        title: 'Best smoke spots on Ancient?',
        description: 'New topic by Zythex',
        date: '3m ago',
        icon: MessageSquare,
    },
    { 
        id: 'f2', 
        title: 'Vortex replied to "1v1 Tournament Sign-ups"',
        description: 'I\'m in! Let\'s do this.',
        date: '1h ago',
        icon: MessageSquare,
    },
    { 
        id: 'f3', 
        title: 'New Replay: n3o vs Ghost on Inferno',
        description: 'A close match with an insane comeback.',
        date: '5h ago',
        icon: Video,
    },
];

export const shopItems: Cosmetic[] = [
    { id: 'c1', name: 'Cyberpunk Neon', description: 'A vibrant, glowing frame.', type: 'Frame', rarity: 'Legendary', price: 1500, owned: true, imageUrl: 'https://i.postimg.cc/PqYp5d7C/frame-legendary.png' },
    { id: 'c2', name: 'Synthwave Sunset', description: 'Animated banner of a retro sunset.', type: 'Banner', rarity: 'Epic', price: 800, owned: true, imageUrl: 'https://i.postimg.cc/tJ5gST8z/banner-animated.gif' },
    { id: 'c3', name: 'Pro League 2024', description: 'Badge for participating in the pro league.', type: 'Badge', rarity: 'Epic', price: 500, owned: false, imageUrl: 'https://i.postimg.cc/KzCjz1fS/badge-epic.png' },
    { id: 'c4', name: 'Headshot Machine', description: 'Show off your aim.', type: 'Title', rarity: 'Rare', price: 250, owned: true },
    { id: 'c5', name: 'Azure Frame', description: 'A simple, clean blue frame.', type: 'Frame', rarity: 'Common', price: 100, owned: false, imageUrl: 'https://i.postimg.cc/C1xX639D/frame-common.png' },
];

export const forumCategories: ForumCategory[] = [
    { id: 'cat1', title: 'Announcements', description: 'Official news and updates from the Eclip.pro team.' },
    { id: 'cat2', title: 'General Discussion', description: 'Talk about anything related to CS2 and Eclip.pro.' },
    { id: 'cat3', title: 'Feedback & Suggestions', description: 'Have an idea? Let us know here.' },
    { id: 'cat4', title: 'Bug Reports', description: 'Found a bug? Report it here to help us improve the platform.' },
];

export const recentForumActivity: ForumThread[] = [
    {
        id: 't1',
        categoryId: 'cat2',
        title: 'Best smoke spots on Ancient?',
        author: topPlayers[0],
        replies: 12,
        views: 154,
        lastPost: { author: topPlayers[1], date: '5m ago' }
    },
    {
        id: 't2',
        categoryId: 'cat3',
        title: 'Suggestion: Add a 2v2 Wingman queue',
        author: topPlayers[4],
        replies: 34,
        views: 450,
        lastPost: { author: currentUser, date: '30m ago' }
    },
    {
        id: 't3',
        categoryId: 'cat1',
        title: 'Season 2 Start & Rank Reset',
        author: { ...currentUser, username: 'Admin' },
        replies: 150,
        views: 2300,
        lastPost: { author: topPlayers[3], date: '2h ago' }
    },
];
