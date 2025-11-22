import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    (set) => ({
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
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);
