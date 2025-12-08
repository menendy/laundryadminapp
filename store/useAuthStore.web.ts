// C:\Users\WIN10\laundryadminapp\store\useAuthStore.web.ts
import { create } from "zustand";

interface AuthState {
  user: any | null;
  activeTenant: string | null;
  isHydrated: boolean;

  login: (user: any, tenant: string) => void;
  logout: () => void;
  hydrate: () => void;
}

const USER_KEY = "auth-user";
const TENANT_KEY = "auth-tenant";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeTenant: null,
  isHydrated: false,

  login: (user, tenant) => {
    set({ user, activeTenant: tenant });

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.localStorage.setItem(TENANT_KEY, tenant);
      } catch (err) {
        console.error("[AuthStore.web] Failed to persist auth", err);
      }
    }
  },

  logout: () => {
    set({ user: null, activeTenant: null });

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.removeItem(TENANT_KEY);
      } catch (err) {
        console.error("[AuthStore.web] Failed to clear auth", err);
      }
    }
  },

  // Dipanggil sekali dari AppInitializer
  hydrate: () => {
    // Biar aman kalau kepanggil 2x
    if (get().isHydrated) return;

    if (typeof window === "undefined") {
      // Di server (kalau ada), langsung tandai hydrated
      set({ isHydrated: true });
      return;
    }

    try {
      const rawUser = window.localStorage.getItem(USER_KEY);
      const rawTenant = window.localStorage.getItem(TENANT_KEY);

      set({
        user: rawUser ? JSON.parse(rawUser) : null,
        activeTenant: rawTenant ?? null,
        isHydrated: true,
      });

      console.log("[AuthStore.web] Hydrated", {
        hasUser: !!rawUser,
        tenant: rawTenant,
      });
    } catch (err) {
      console.error("[AuthStore.web] Failed to hydrate auth", err);
      set({
        user: null,
        activeTenant: null,
        isHydrated: true,
      });
    }
  },
}));
