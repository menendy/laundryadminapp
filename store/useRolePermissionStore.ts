import { create } from "zustand";

export type PermissionMap = {
  [pageId: string]: string[];
};

interface RolePermissionState {
  permissions: PermissionMap;
  setPermission: (pageId: string, actions: string[]) => void;
  setPermissions: (payload: PermissionMap) => void; // 🔥 NEW
  resetPermissions: () => void;
}

export const useRolePermissionStore = create<RolePermissionState>((set) => ({
  permissions: {},

  // 🔥 Update 1 page
  setPermission: (pageId, actions) =>
    set((state) => ({
      permissions: {
        ...state.permissions,
        [pageId]: actions,
      },
    })),

  // 🔥 Update semua dari preload backend
  setPermissions: (payload) =>
    set(() => ({
      permissions: payload,
    })),

  // Reset semua
  resetPermissions: () =>
    set(() => ({
      permissions: {},
    })),
}));
