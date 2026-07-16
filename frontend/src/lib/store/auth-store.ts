import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setTokens, clearTokens, setTokenRefreshListener } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'PLAYER';
  player?: {
    id: string;
    name: string;
    nickname?: string;
    photoUrl?: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setSession: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      clearSession: () => {
        clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'fronton-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && state?.refreshToken) {
          setTokens(state.accessToken, state.refreshToken);
          authApi.me().catch(() => {
            state.clearSession();
          });
        }
        state?.setHasHydrated(true);
      },
    }
  )
);

setTokenRefreshListener((accessToken, refreshToken) => {
  useAuthStore.setState({ accessToken, refreshToken });
});
