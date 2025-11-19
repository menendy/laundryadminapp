// store/useAccessStore.ts
import { create } from "zustand";

export type AccessState = {
  allowedPages: string[];             
  permissions: Record<string, any>;   

  setAccess: (pages: string[], perms: Record<string, any>) => void;
};

export const useAccessStore = create<AccessState>((set) => ({
  allowedPages: [],
  permissions: {},

  setAccess: (pages, perms) =>
    set({
      allowedPages: pages,
      permissions: perms,
    }),
}));
