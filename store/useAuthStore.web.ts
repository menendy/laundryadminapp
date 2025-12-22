// store/useAuthStore.web.ts
import { create } from "zustand";

interface AuthState {
  user: any | null;
  activeTenant: string | null;
  token: string | null;

  isHydrated: boolean;
  authReady: boolean;

  login: (user: any, tenant: string | null, token: string) => void;
  logout: () => void;
  hydrate: () => void;
  setAuthReady: (ready: boolean) => void;
}

const USER_KEY = "auth-user";
const TENANT_KEY = "auth-tenant";
const TOKEN_KEY = "auth-token";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeTenant: null,
  token: null,

  isHydrated: false,
  authReady: false,

  // =========================
  // LOGIN (DIPANGGIL LISTENER)
  // =========================
  login: (user, tenant, token) => {
    set({
      user,
      activeTenant: tenant,
      token,
      authReady: true,
    });

    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (tenant) localStorage.setItem(TENANT_KEY, tenant);
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },

  // =========================
  // LOGOUT
  // =========================
  logout: () => {
    set({
      user: null,
      activeTenant: null,
      token: null,
      authReady: true, // ⬅️ auth resolved (anonymous)
    });

    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TENANT_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },

  // =========================
  // HYDRATE (STORAGE ONLY)
  // ❌ JANGAN SET authReady
  // =========================
  hydrate: () => {
    if (get().isHydrated) return;

    try {
      const user = localStorage.getItem(USER_KEY);
      const tenant = localStorage.getItem(TENANT_KEY);
      const token = localStorage.getItem(TOKEN_KEY);

      set({
        user: user ? JSON.parse(user) : null,
        activeTenant: tenant,
        token,
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  setAuthReady: (ready) => set({ authReady: ready }),
}));
