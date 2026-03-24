// store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, tokenStorage } from '@/lib/api';
import type { Me, AuthResponse } from '@/types/api';

// ─── State shape ──────────────────────────────────────────────────────────────

interface AuthState {
  user: Me | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearAuth: () => void;
}

// ─── Payload types ────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // ── Register ────────────────────────────────────────────────────────────
      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<AuthResponse>(
            '/auth/register',
            payload,
          );
          tokenStorage.set(data.accessToken, data.refreshToken, data.user.id);
          // Fetch full Me profile (includes tenants)
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Login ───────────────────────────────────────────────────────────────
      login: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<AuthResponse>('/auth/login', payload);
          tokenStorage.set(data.accessToken, data.refreshToken, data.user.id);
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Logout ──────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          const refreshToken = tokenStorage.getRefresh();
          await api.post('/auth/logout', { refreshToken });
        } catch {
          // Logout best-effort — clear locally regardless
        } finally {
          get().clearAuth();
        }
      },

      // ── Fetch current user ───────────────────────────────────────────────────
      fetchMe: async () => {
        const { data } = await api.get<Me>('/users/me');
        set({ user: data, isAuthenticated: true });
      },

      // ── Clear local state ────────────────────────────────────────────────────
      clearAuth: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-store',
      // Only persist the user — tokens live in localStorage via tokenStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
