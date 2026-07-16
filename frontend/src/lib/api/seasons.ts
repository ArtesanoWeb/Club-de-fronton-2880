import { apiRequest } from './client';

export type SeasonStatus = 'UPCOMING' | 'ACTIVE' | 'FINISHED';

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: SeasonStatus;
  createdAt: string;
}

export interface CreateSeasonPayload {
  name: string;
  startDate: string;
  endDate?: string;
  status?: SeasonStatus;
}

export interface UpdateSeasonPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: SeasonStatus;
}

interface StandingPlayerInfo {
  id: string;
  name: string;
  nickname?: string;
  photoUrl?: string;
}

export interface SeasonStandingIndividual {
  playerId: string;
  player: StandingPlayerInfo;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface SeasonStandingDuo {
  duoId: string;
  duo: {
    id: string;
    player1: StandingPlayerInfo;
    player2: StandingPlayerInfo;
  };
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface SeasonStandings {
  individual: SeasonStandingIndividual[];
  duos: SeasonStandingDuo[];
}

export const seasonsApi = {
  getSeasons: () => apiRequest<Season[]>('/seasons'),

  getSeason: (id: string) => apiRequest<Season>(`/seasons/${id}`),

  createSeason: (data: CreateSeasonPayload) =>
    apiRequest<Season>('/seasons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSeason: (id: string, data: UpdateSeasonPayload) =>
    apiRequest<Season>(`/seasons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteSeason: (id: string) =>
    apiRequest<void>(`/seasons/${id}`, { method: 'DELETE' }),

  getStandings: (id: string) => apiRequest<SeasonStandings>(`/seasons/${id}/standings`),
};
