import { api } from "./client";

export interface MitraPayload {
  nama: string;
  telp: string;
  alamat: string;
}

export interface MitraListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
}

export const getMitraList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "semua" | "nama" | "telp" = "semua"
): Promise<MitraListResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());
    params.append("mode", mode);

    const res = await api.get(`/getMitraList?${params.toString()}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getMitraList error:", err);
    return { success: false, data: [] };
  }
};


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
