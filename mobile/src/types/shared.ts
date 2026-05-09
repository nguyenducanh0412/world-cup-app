export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'
export type MatchStage = 'GROUP' | 'R16' | 'QF' | 'SF' | 'THIRD_PLACE' | 'FINAL'
export type ScoringMode = 'EXACT_SCORE' | 'OUTCOME_ONLY'

export interface User {
  id: string
  supabaseId: string
  username: string
  avatarUrl?: string
  createdAt: string
}

export interface Match {
  id: string
  externalId: string
  homeTeam: string
  awayTeam: string
  homeFlagUrl?: string
  awayFlagUrl?: string
  homeScore?: number
  awayScore?: number
  scheduledAt: string
  status: MatchStatus
  stage: MatchStage
  groupName?: string
  venue?: string
  updatedAt: string
}

export interface Room {
  id: string
  name: string
  inviteCode: string
  creatorId: string
  scoringMode: ScoringMode
  createdAt: string
  memberCount?: number
  members?: RoomMember[]
}

export interface RoomMember {
  id: string
  userId: string
  roomId: string
  joinedAt: string
  user?: User
}

export interface Prediction {
  id: string
  userId: string
  matchId: string
  roomId: string
  predictedHome: number
  predictedAway: number
  pointsEarned?: number
  isSettled: boolean
  createdAt: string
  user?: User
  match?: Match
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl?: string
  totalPoints: number
  totalPredictions: number
  exactScores: number
  correctOutcomes: number
  rank: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
}
