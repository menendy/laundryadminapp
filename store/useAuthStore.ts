// C:\Users\WIN10\laundryadminapp\store\useAuthStore.ts
import { create } from "zustand";
import { Storage } from "./storage";

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  hydrate: async () => {
    const token = await Storage.getItem("auth-token");
    const userStr = await Storage.getItem("auth-user");

    set({
      token: token,
      user: userStr ? JSON.parse(userStr) : null,
      isHydrated: true,
    });
  },

  login: async (user: any, token: string) => {
    set({ user, token });
    await Storage.setItem("auth-token", token);
    await Storage.setItem("auth-user", JSON.stringify(user));
  },

  logout: async () => {
    set({ user: null, token: null });
    await Storage.removeItem("auth-token");
    await Storage.removeItem("auth-user");
  },
}));
