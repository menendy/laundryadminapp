import { create } from "zustand";
import { PageAdminItem } from "../services/api/pagesAdminService2";

const DRAFT_KEY = "pages-admin-draft-add";

interface DraftState {
  drafts: PageAdminItem[];
  isHydrated: boolean;

  addDraft: (item: PageAdminItem) => void;
  clearDrafts: () => void;
  hydrate: () => void;
  addPermissionDraft: (
    pageId: string,
    permission: { url: string; permission: string }
  ) => void;

  // ✅ BARU: Signal untuk Edit Data
  updateSignal: any | null;
  setUpdateSignal: (signal: any) => void;
}

export const usePagesAdminDraftStore = create<DraftState>((set, get) => ({
  drafts: [],
  isHydrated: false,
  
  // ✅ Initial State Signal
  updateSignal: null,

  addDraft: (item) => {
    const next = [...get().drafts, item];
    set({ drafts: next });
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
  },

  addPermissionDraft: (pageId, permission) => {
    const next = get().drafts.map(draft => {
      if (draft.id !== pageId) return draft;
      return {
        ...draft,
        permissions_type: {
          ...(draft.permissions_type || {}),
          [permission.url]: permission.permission,
        },
      };
    });
    set({ drafts: next });
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
  },

  clearDrafts: () => {
    set({ drafts: [] });
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  },

  hydrate: () => {
    if (get().isHydrated) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      set({
        drafts: raw ? JSON.parse(raw) : [],
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  // ✅ BARU: Setter Signal
  setUpdateSignal: (signal) => set({ updateSignal: signal }),
}));