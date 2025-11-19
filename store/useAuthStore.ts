// store/useAuthStore.ts
import { create } from "zustand";
import { Storage } from "./storage";

export type ActiveTenant = {
  owner_id: string;
  outlet_id: string;
  role: string;
};

export type AuthUser = {
  uid: string;
  email: string;
  name?: string;
  [key: string]: any;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  roleIds: string[];
  activeTenant: ActiveTenant | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  login: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;

  setRoleIds: (r: string[]) => void;
  setUser: (u: AuthUser | null) => void;
  setActiveTenant: (t: ActiveTenant | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  roleIds: [],
  activeTenant: null,
  isHydrated: false,

  hydrate: async () => {
    const token = await Storage.getItem("auth-token");
    const userStr = await Storage.getItem("auth-user");

    set({
      token,
      user: userStr ? JSON.parse(userStr) : null,
      isHydrated: true,
    });
  },

  login: async (user, token) => {
    set({ user, token });
    await Storage.setItem("auth-token", token);
    await Storage.setItem("auth-user", JSON.stringify(user));
  },

  logout: async () => {
    set({ user: null, token: null, roleIds: [], activeTenant: null });
    await Storage.removeItem("auth-token");
    await Storage.removeItem("auth-user");
  },

  setRoleIds: (roleIds) => set({ roleIds }),
  setUser: (user) => set({ user }),
  setActiveTenant: (activeTenant) => set({ activeTenant }),
}));
