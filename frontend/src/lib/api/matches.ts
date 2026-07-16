import { apiRequest } from './client';

export type MatchModality =
  | 'TEMPORADA_OFICIAL'
  | 'REY_DE_CANCHA'
  | 'RETO'
  | 'AMISTOSO';

export interface Duo {
  id: string;
  player1Id: string;
  player2Id: string;
  player1: {
    id: string;
    name: string;
    nickname?: string;
  };
  player2: {
    id: string;
    name: string;
    nickname?: string;
  };
}

export interface Match {
  id: string;
  seasonId?: string;
  season?: {
    id: string;
    name: string;
  };
  modality: MatchModality;
  teamAId: string;
  teamBId: string;
  teamA: Duo;
  teamB: Duo;
  scoreA: number;
  scoreB: number;
  mvpPlayerId?: string;
  mvpPlayer?: {
    id: string;
    name: string;
    nickname?: string;
  };
  durationMinutes?: number;
  notes?: string;
  playedAt: string;
  createdAt: string;
}

export interface CreateMatchPayload {
  seasonId?: string;
  modality: MatchModality;
  teamA: [string, string];
  teamB: [string, string];
  scoreA: number;
  scoreB: number;
  mvpPlayerId?: string;
  durationMinutes?: number;
  notes?: string;
  playedAt?: string;
}

export const matchesApi = {
  getMatches: () => apiRequest<Match[]>('/matches'),

  getMatch: (id: string) => apiRequest<Match>(`/matches/${id}`),

  createMatch: (data: CreateMatchPayload) =>
    apiRequest<Match>('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
