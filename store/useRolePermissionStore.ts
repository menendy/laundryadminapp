import { create } from "zustand";

export type PermissionMap = {
  [pageId: string]: string[]; // example: { "PAGE1": ["baca", "tambah"] }
};

interface RolePermissionState {
  permissions: PermissionMap;
  setPermission: (pageId: string, actions: string[]) => void;
  resetPermissions: () => void;
}

export const useRolePermissionStore = create<RolePermissionState>((set) => ({
  permissions: {},

  setPermission: (pageId, actions) =>
    set((state) => ({
      permissions: {
        ...state.permissions,
        [pageId]: actions,
      },
    })),

  resetPermissions: () =>
    set(() => ({
      permissions: {},
    })),
}));
