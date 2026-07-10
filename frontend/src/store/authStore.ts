import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '#src/api/types';
import { clearSession, setSession } from '#src/api/session';

interface AuthState {
  token: string | null;
  user: UserDto | null;
  login: (token: string, user: UserDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        setSession(token, user);
        set({ token, user });
      },
      logout: () => {
        clearSession();
        set({ token: null, user: null });
      },
    }),
    {
      name: 'farmatrack-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token && state.user) {
          setSession(state.token, state.user);
        }
      },
    },
  ),
);
