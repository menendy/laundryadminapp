import { api } from "./client";

export interface MitraPayload {
  nama: string;
  telp: string;
  alamat: string;
}

export interface MitraResponse {
  success?: boolean;
  id?: string;
  message?: string;
  field?: string | null;
  status?: number;
  errors?: { field: string | null; message: string }[];
}

/**
 * 🚀 Tambah mitra baru
 * - Tidak perlu try/catch lagi
 * - Karena error sudah ditangani oleh interceptor
 */
export const addMitra = async (payload: MitraPayload): Promise<MitraResponse> => {
  const res = await api.post("/addMitra_v2", payload);
  return res.data;
};
