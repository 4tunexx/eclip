export type ID = string
export type Timestamp = string

export interface User {
  id: ID
  steamId: string
  username: string
  eclipId: string
  createdAt: Timestamp
}

export interface Profile {
  id: ID
  userId: ID
  avatarUrl: string
  bannerUrl: string
  backgroundUrl: string
  rating: number
  vip: boolean
  country: string
  statsSummary: ProfileStatsSummary
}

export interface ProfileStatsSummary {
  matches: number
  wins: number
  losses: number
  headshotRatio: number
  mvps: number
  clutches: number
  streak: number
}

export type LadderType = "5v5" | "1v1"

export interface Match {
  id: ID
  ladder: LadderType
  serverInstanceId: ID
  startedAt: Timestamp
  endedAt?: Timestamp
  status: "queued" | "active" | "completed" | "cancelled"
}

export interface MatchPlayerStats {
  userId: ID
  kills: number
  deaths: number
  headshots: number
  mvps: number
  clutches: number
  ratingDelta: number
}

export interface MatchStats {
  matchId: ID
  players: MatchPlayerStats[]
  winnerTeamId?: ID
}

export interface LeaderboardEntry {
  id: ID
  userId: ID
  period: "daily" | "weekly" | "monthly"
  wins: number
  streak: number
  headshotRatio: number
  mvps: number
  clutches: number
  rating: number
}

export interface Achievement {
  id: ID
  code: string
  name: string
  description: string
  points: number
}

export interface UserAchievement {
  id: ID
  userId: ID
  achievementId: ID
  unlockedAt: Timestamp
}

export interface Wallet {
  id: ID
  userId: ID
  balance: number
}

export type TransactionType = "earn" | "spend" | "adjust"

export interface Transaction {
  id: ID
  walletId: ID
  amount: number
  type: TransactionType
  reason: string
  createdAt: Timestamp
}

export interface ACFlag {
  id: ID
  userId: ID
  matchId?: ID
  score: number
  label: string
  createdAt: Timestamp
}

export interface ServerInstance {
  id: ID
  provider: "gcp" | "aws" | "local"
  region: string
  ip: string
  port: number
  status: "starting" | "active" | "stopping" | "stopped"
  createdAt: Timestamp
}

export interface Tournament {
  id: ID
  name: string
  season: string
  status: "upcoming" | "active" | "completed"
}

export interface Team {
  id: ID
  name: string
  clanTag?: string
}

export interface SupportTicket {
  id: ID
  userId: ID
  subject: string
  status: "open" | "closed"
  createdAt: Timestamp
}

export interface ModeratorAction {
  id: ID
  moderatorId: ID
  targetUserId: ID
  action: string
  createdAt: Timestamp
}

export interface Friend {
  id: ID
  userId: ID
  friendUserId: ID
  createdAt: Timestamp
}

export interface Clan {
  id: ID
  name: string
  tag: string
  leaderUserId: ID
  createdAt: Timestamp
}

export interface RatingScan {
  userId: ID
  valveRating: number
  eclipRating: number
  timestamp: Timestamp
}

export interface QueueTicket {
  id: ID
  userId: ID
  ladder: LadderType
  createdAt: Timestamp
}