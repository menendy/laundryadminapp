import { create } from "zustand";
import { Storage } from "./storage";

interface AuthState {
  user: any | null;
  activeTenant: string | null;
  isHydrated: boolean;

  login: (user: any, tenant: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeTenant: null,
  isHydrated: false,

  login: (user, tenant) => {
    set({ user, activeTenant: tenant });
    Storage.setItem("auth-user", JSON.stringify(user));
    Storage.setItem("auth-tenant", tenant);
  },

  logout: () => {
    set({ user: null, activeTenant: null });
    Storage.removeItem("auth-user");
    Storage.removeItem("auth-tenant");
  },

  hydrate: async () => {
    const rawUser = await Storage.getItem("auth-user");
    const rawTenant = await Storage.getItem("auth-tenant");

    set({
      user: rawUser ? JSON.parse(rawUser) : null,
      activeTenant: rawTenant ?? null,
      isHydrated: true,
    });
  },
}));
