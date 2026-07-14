import { apiRequest } from './client';

export interface Player {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  photoUrl?: string;
  dominantHand?: 'LEFT' | 'RIGHT';
  playStyle?: string;
  createdAt: string;
  updatedAt: string;
  ranking?: Ranking | null;
}

export interface Ranking {
  id: string;
  playerId: string;
  points: number;
  wins: number;
  losses: number;
  currentStreak: number;
  updatedAt: string;
}

export interface UpdatePlayerPayload {
  name?: string;
  nickname?: string;
  photoUrl?: string;
  dominantHand?: 'LEFT' | 'RIGHT';
  playStyle?: string;
}

export const playersApi = {
  getPlayers: () => apiRequest<Player[]>('/players'),

  getPlayer: (id: string) => apiRequest<Player>(`/players/${id}`),

  updateMe: (data: UpdatePlayerPayload) =>
    apiRequest<Player>('/players/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updatePlayer: (id: string, data: UpdatePlayerPayload) =>
    apiRequest<Player>(`/players/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
