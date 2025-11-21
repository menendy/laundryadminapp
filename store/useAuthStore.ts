import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

interface AuthState {
  user: any | null;
  activeTenant: string | null;
  isHydrated: boolean;

  login: (user: any, tenant: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeTenant: null,
      isHydrated: false,

      login: (user, tenant) =>
        set({
          user,
          activeTenant: tenant,
        }),

      logout: () =>
        set({
          user: null,
          activeTenant: null,
        }),

      hydrate: () => set({ isHydrated: true }),
    }),

    {
      name: "auth-storage",

      // storage otomatis: web = localStorage, mobile = AsyncStorage
      storage: createJSONStorage(() =>
        Platform.OS === "web"
          ? {
              getItem: (key) => Promise.resolve(localStorage.getItem(key)),
              setItem: (key, value) => {
                localStorage.setItem(key, value);
                return Promise.resolve();
              },
              removeItem: (key) => {
                localStorage.removeItem(key);
                return Promise.resolve();
              },
            }
          : AsyncStorage
      ),

      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);
