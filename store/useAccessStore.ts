import { create } from "zustand";

export const useAccessStore = create(() => ({
  allowedPages: [],
  permissions: {},
}));
