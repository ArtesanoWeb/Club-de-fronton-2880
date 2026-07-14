import { apiRequest } from './client';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'PLAYER';
  createdAt: string;
  updatedAt: string;
  player?: Player;
}

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
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  nickname?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  login: (data: LoginPayload) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  logout: () =>
    apiRequest<void>('/auth/logout', { method: 'POST' }),

  me: () => apiRequest<User>('/auth/me'),
};
