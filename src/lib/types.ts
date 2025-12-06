import type { LucideIcon } from 'lucide-react';

export type User = {
  id: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  rank: string;
  esr: number;
  coins: number;
  isAdmin?: boolean;
  equippedFrame?: string;
  equippedBanner?: string;
  title?: string;
};

export type Player = {
  id: string;
  username: string;
  avatarUrl: string;
  rank: string;
  esr: number;
  steamId?: string;
  equippedFrame?: string;
};

export type PlayerStats = Player & {
  kills: number;
  deaths: number;
  assists: number;
  hsPercentage: number;
  mvps: number;
  adr: number;
};

export type Match = {
  id:string;
  map: string;
  mapImageUrl: string;
  score: string;
  result: 'Win' | 'Loss' | 'Draw';
  date: string;
  players: PlayerStats[];
};

export type NewsArticle = {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    icon: LucideIcon;
};

export type ForumActivity = {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: LucideIcon;
};

export type Cosmetic = {
    id: string;
    name: string;
    description: string;
    type: 'Frame' | 'Banner' | 'Badge' | 'Title';
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    price: number;
    owned: boolean;
    imageUrl?: string;
};

export type Mission = {
    id: string;
    title: string;
    progress: number;
    total: number;
    reward: string;
};

export type Achievement = {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
};

export type ForumCategory = {
    id: string;
    title: string;
    description: string;
};

export type ForumThread = {
    id: string;
    categoryId: string;
    title: string;
    author: Player | User;
    replies: number;
    views: number;
    lastPost: {
        author: Player | User;
        date: string;
    };
};
