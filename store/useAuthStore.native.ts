import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthUser {
  uid: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  activeTenant: string | null;
  token: string | null;

  isHydrated: boolean;
  authReady: boolean;

  login: (user: AuthUser, tenant: string | null, token: string) => void;
  logout: () => void;
  hydrate: () => void;
  setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeTenant: null,
      token: null,

      isHydrated: false,
      authReady: false,

      login: (user, tenant, token) =>
        set({
          user,
          activeTenant: tenant,
          token,
          authReady: true,
        }),

      logout: () =>
        set({
          user: null,
          activeTenant: null,
          token: null,
          authReady: true, // auth resolved
        }),

      hydrate: () =>
        set({
          isHydrated: true,
        }),

      setAuthReady: (ready) => set({ authReady: ready }),
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
