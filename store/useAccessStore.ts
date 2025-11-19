import { create } from "zustand";

type AccessStore = {
  allowedPages: string[];
  permissionsByPage: Record<string, any>;

  setAccess: (pages: string[], perms: Record<string, any>) => void;
  clearAccess: () => void;
};

export const useAccessStore = create<AccessStore>((set) => ({
  allowedPages: [],
  permissionsByPage: {},

  setAccess: (pages, perms) =>
    set({
      allowedPages: pages,
      permissionsByPage: perms,
    }),

  clearAccess: () =>
    set({
      allowedPages: [],
      permissionsByPage: {},
    }),
}));
