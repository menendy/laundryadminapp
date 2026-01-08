import { create } from "zustand";
import { PageAdminItem } from "../services/api/pagesAdminService2";

const DRAFT_KEY = "pages-admin-draft-add";

interface DraftState {
  drafts: PageAdminItem[];
  isHydrated: boolean;

  // EXISTING
  addDraft: (item: PageAdminItem) => void;
  clearDrafts: () => void;
  hydrate: () => void;

  // ✅ BARU (TAMBAH PERMISSION KE PAGE)
  addPermissionDraft: (
    pageId: string,
    permission: { url: string; permission: string }
  ) => void;
}

export const usePagesAdminDraftStore = create<DraftState>((set, get) => ({
  drafts: [],
  isHydrated: false,

  // =========================
  // ADD NEW ITEM ONLY
  // =========================
  addDraft: (item) => {
    const next = [...get().drafts, item];
    set({ drafts: next });

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
  },

  // =========================
  // ADD PERMISSION TO PAGE
  // =========================
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

  // =========================
  // CLEAR (ON REFRESH / SAVE)
  // =========================
  clearDrafts: () => {
    set({ drafts: [] });
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  },

  // =========================
  // HYDRATE (OPTIONAL)
  // =========================
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
}));
