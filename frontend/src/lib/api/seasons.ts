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
};
