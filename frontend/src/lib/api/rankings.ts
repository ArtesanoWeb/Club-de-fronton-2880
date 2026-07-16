import { apiRequest } from './client';

interface RankedPlayerInfo {
  id: string;
  name: string;
  nickname?: string;
  photoUrl?: string;
}

export interface RankedPlayer {
  id: string;
  playerId: string;
  points: number;
  wins: number;
  losses: number;
  currentStreak: number;
  updatedAt: string;
  player: RankedPlayerInfo;
}

export interface RankedDuo {
  id: string;
  duoId: string;
  points: number;
  wins: number;
  losses: number;
  currentStreak: number;
  updatedAt: string;
  duo: {
    id: string;
    player1: RankedPlayerInfo;
    player2: RankedPlayerInfo;
  };
}

export const rankingsApi = {
  getIndividual: () => apiRequest<RankedPlayer[]>('/rankings/individual'),

  getDuo: () => apiRequest<RankedDuo[]>('/rankings/duo'),
};
