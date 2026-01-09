import { create } from 'zustand';

/**
 * -------------------------------------------------------
 * Domain Types (kept minimal & stable)
 * -------------------------------------------------------
 */

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type User = {
  id: string;
  name: string;
  email: string;
  isEmailVerified:boolean;
  roles: Role[];
};

export type SessionInfo = {
  sessionId?: string;
  device?: string;
  ip?: string;
  userAgent?: string;
  expiresAt?: string;
};

/**
 * -------------------------------------------------------
 * Auth Store State
 * -------------------------------------------------------
 * - accessToken: short-lived JWT (in-memory only)
 * - user: logged-in user snapshot
 * - session: current device session info
 * -------------------------------------------------------
 */

type AuthState = {
  accessToken: string | null;
  user: User | null;
  session: SessionInfo | null;

  // setters
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setSession: (session: SessionInfo | null) => void;

  // helpers
  clearAuth: () => void;
};

/**
 * -------------------------------------------------------
 * Zustand Store
 * -------------------------------------------------------
 */

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  session: null,

  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      session: null,
    }),
}));

/**
 * -------------------------------------------------------
 * Non-react helpers (VERY IMPORTANT)
 * -------------------------------------------------------
 * These allow access from apiClient, interceptors, etc.
 * without violating React rules.
 * -------------------------------------------------------
 */

export const getAccessToken = (): string | null =>
  useAuthStore.getState().accessToken;

export const setAccessToken = (token: string | null): void =>
  useAuthStore.getState().setAccessToken(token);

export const setAuthUser = (user: User | null): void =>
  useAuthStore.getState().setUser(user);

export const setAuthSession = (session: SessionInfo | null): void =>
  useAuthStore.getState().setSession(session);

export const clearAuth = (): void =>
  useAuthStore.getState().clearAuth();
