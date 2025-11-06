import { api } from "./client";

export interface MitraPayload {
  nama: string;
  telp: string;
  alamat: string;
}

export const addMitra = async (payload: MitraPayload) => {
  const res = await api.post("/addMitra_v2", payload);
  return res.data;
};

// Tambahan opsional (kalau nanti ada)
export const getAllMitra = async () => {
  const res = await api.get("/getAllMitra");
  return res.data;
};
