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

  login: (user: AuthUser, tenant: string, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeTenant: null,
      token: null,
      isHydrated: false,

      // ❌ JANGAN tulis : void
      login: (user, tenant, token) =>
        set((state) => ({
          ...state,
          user,
          activeTenant: tenant,
          token,
        })),

      logout: () =>
        set((state) => ({
          ...state,
          user: null,
          activeTenant: null,
          token: null,
        })),

      hydrate: () =>
        set((state) => ({
          ...state,
          isHydrated: true,
        })),
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
