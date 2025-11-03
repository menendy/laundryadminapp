import { create } from "zustand";
import { nanoid } from "nanoid";

type Karyawan = {
  id: string;
  nama: string;
  posisi: string;
  telp: string;
};

type State = {
  karyawan: Karyawan[];
  addKaryawan: (data: Omit<Karyawan, "id">) => void;
  updateKaryawan: (data: Karyawan) => void;
  removeKaryawan: (id: string) => void;
};

export const useKaryawanStore = create<State>((set) => ({
  karyawan: [
    { id: "1", nama: "Budi", posisi: "Kasir", telp: "08123456789" },
    { id: "2", nama: "Sinta", posisi: "Cuci", telp: "08234567890" },
  ],
  addKaryawan: (data) =>
    set((state) => ({
      karyawan: [...state.karyawan, { id: nanoid(6), ...data }],
    })),
  updateKaryawan: (data) =>
    set((state) => ({
      karyawan: state.karyawan.map((k) => (k.id === data.id ? data : k)),
    })),
  removeKaryawan: (id) =>
    set((state) => ({
      karyawan: state.karyawan.filter((k) => k.id !== id),
    })),
}));
