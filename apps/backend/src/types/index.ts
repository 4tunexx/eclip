export type Ladder = "5v5" | "1v1"

export interface QueueTicket {
  id: string
  userId: string
  ladder: Ladder
  steamId: string
  createdAt: string
}

export interface MatchAssignment {
  matchId: string
  ladder: Ladder
  teamA: string[]
  teamB: string[]
}

export interface AnticheatLog {
  id: string
  steamId: string
  matchId: string
  event: string
  severity: "info" | "warn" | "critical"
  payload: Record<string, unknown>
  createdAt: string
}
