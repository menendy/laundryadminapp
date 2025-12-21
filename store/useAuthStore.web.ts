// store/useAuthStore.web.ts
import { create } from "zustand";

interface AuthState {
  user: any | null;
  activeTenant: string | null;
  token: string | null;
  isHydrated: boolean;

  login: (user: any, tenant: string, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

const USER_KEY = "auth-user";
const TENANT_KEY = "auth-tenant";
const TOKEN_KEY = "auth-token";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeTenant: null,
  token: null,
  isHydrated: false,

  // =========================
  // 🔐 LOGIN (WEB)
  // =========================
  login: (user, tenant, token) => {
    set({ user, activeTenant: tenant, token });

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.localStorage.setItem(TENANT_KEY, tenant);
        window.localStorage.setItem(TOKEN_KEY, token);
      } catch (err) {
        console.error("[AuthStore.web] Failed to persist auth", err);
      }
    }
  },

  // =========================
  // 🚪 LOGOUT
  // =========================
  logout: () => {
    set({ user: null, activeTenant: null, token: null });

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.removeItem(TENANT_KEY);
        window.localStorage.removeItem(TOKEN_KEY);
      } catch (err) {
        console.error("[AuthStore.web] Failed to clear auth", err);
      }
    }
  },

  // =========================
  // ♻️ HYDRATE (WEB)
  // =========================
  hydrate: () => {
    if (get().isHydrated) return;

    if (typeof window === "undefined") {
      set({ isHydrated: true });
      return;
    }

    try {
      const rawUser = window.localStorage.getItem(USER_KEY);
      const rawTenant = window.localStorage.getItem(TENANT_KEY);
      const rawToken = window.localStorage.getItem(TOKEN_KEY);

      set({
        user: rawUser ? JSON.parse(rawUser) : null,
        activeTenant: rawTenant ?? null,
        token: rawToken ?? null,
        isHydrated: true,
      });

      console.log("[AuthStore.web] Hydrated", {
        hasUser: !!rawUser,
        hasToken: !!rawToken,
        tenant: rawTenant,
      });
    } catch (err) {
      console.error("[AuthStore.web] Failed to hydrate auth", err);
      set({
        user: null,
        activeTenant: null,
        token: null,
        isHydrated: true,
      });
    }
  },
}));
