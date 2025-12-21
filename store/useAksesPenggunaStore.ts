import { create } from "zustand";

interface AksesPenggunaState {
    name: string;
    desc: string;
    active: boolean;
    appAccess: string[];

    setField: (field: string, value: any) => void;
    reset: () => void;
}

export const useAksesPenggunaStore = create<AksesPenggunaState>((set) => ({
    name: "",
    desc: "",
    active: true,
    appAccess: [],

    setField: (field, value) =>
        set((state) => ({
            ...state,
            [field]: value,
        })),

    reset: () =>
        set({
            name: "",
            desc: "",
            active: true,
            appAccess: [],
        }),
}));
