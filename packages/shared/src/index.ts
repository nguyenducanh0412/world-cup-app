// Enums as string union types
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';
export type MatchStage = 'GROUP' | 'R16' | 'QF' | 'SF' | 'THIRD_PLACE' | 'FINAL';
export type ScoringMode = 'EXACT_SCORE' | 'OUTCOME_ONLY';

// User interface
export interface User {
  id: string;
  supabaseId: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

// Match interface
export interface Match {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlagUrl?: string;
  awayFlagUrl?: string;
  homeScore?: number;
  awayScore?: number;
  scheduledAt: string; // ISO string
  status: MatchStatus;
  stage: MatchStage;
  groupName?: string;
  venue?: string;
  updatedAt: string;
}

// Room interface
export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  creatorId: string;
  scoringMode: ScoringMode;
  createdAt: string;
  memberCount?: number;
  members?: RoomMember[];
}

// RoomMember interface
export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user?: User;
}

// Prediction interface
export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  roomId: string;
  predictedHome: number;
  predictedAway: number;
  pointsEarned?: number;
  isSettled: boolean;
  createdAt: string;
  user?: User;
  match?: Match;
}

// LeaderboardEntry interface
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalPoints: number;
  totalPredictions: number;
  exactScores: number;
  correctOutcomes: number;
  rank: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Export scoring logic
export * from './scoring';
