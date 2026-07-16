import { apiRequest } from './client';

export type MatchModality =
  | 'TEMPORADA_OFICIAL'
  | 'REY_DE_CANCHA'
  | 'RETO'
  | 'AMISTOSO';

// REY_DE_CANCHA no se puede registrar por acá todavía (sesión multi-equipo,
// modelo de datos distinto) — se implementa como módulo aparte más adelante.
export type RegistrableMatchModality = 'TEMPORADA_OFICIAL' | 'RETO' | 'AMISTOSO';

export type MatchFormat = 'BLITZ' | 'CAMPEONATO';

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

export interface MatchSet {
  id: string;
  setNumber: number;
  scoreA: number;
  scoreB: number;
}

export interface Match {
  id: string;
  seasonId?: string;
  season?: {
    id: string;
    name: string;
  };
  modality: MatchModality;
  format: MatchFormat;
  teamAId: string;
  teamBId: string;
  teamA: Duo;
  teamB: Duo;
  scoreA: number;
  scoreB: number;
  sets: MatchSet[];
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

export interface CreateMatchSetPayload {
  scoreA: number;
  scoreB: number;
}

export interface CreateMatchPayload {
  seasonId?: string;
  modality: RegistrableMatchModality;
  format: MatchFormat;
  teamA: [string, string];
  teamB: [string, string];
  sets: CreateMatchSetPayload[];
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
