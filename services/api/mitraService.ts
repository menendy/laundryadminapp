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
}

/**
 * Menambahkan data Mitra baru
 * - Mengembalikan structured response dari backend
 * - Jika error (400/500), tetap dikembalikan dalam format {status, field, message}
 */
export const addMitra = async (payload: MitraPayload): Promise<MitraResponse> => {
  try {
    const res = await api.post("/addMitra_v2", payload);
    return {
      ...res.data,
      status: res.status,
    };
  } catch (err: any) {
    // ✅ Tangkap error dari backend (400, 500, dll)
    if (err.response) {
      // Server memberikan respon error terstruktur
      return {
        field: err.response.data?.field ?? null,
        message: err.response.data?.message ?? "Terjadi kesalahan pada server",
        status: err.response.status,
      };
    }

    // ❌ Kalau tidak ada response (misalnya koneksi terputus)
    return {
      field: null,
      message: err.message || "Tidak dapat terhubung ke server",
      status: 0,
    };
  }
};

/**
 * Ambil semua data Mitra
 * (Tidak diubah)
 */
export const getAllMitra = async () => {
  const res = await api.get("/getAllMitra");
  return res.data;
};
