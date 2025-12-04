import { api } from "./client";

export interface UsersLiteResponse {
  success: boolean;
  data: { id: string; name: string }[];
}

export const getUsersLite = async (): Promise<UsersLiteResponse> => {
  try {
    const res = await api.get("/getUsersLite");
    return res.data;
  } catch (err) {
    console.error("❌ getUsersLite error:", err);
    return { success: false, data: [] };
  }
};

export interface UserProfileResponse { 
  success: boolean;
  profile: {
    uid?: string;
    active?: boolean;
    alamat?: string;
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    outlet_id_default?: string | null;
  } | null; // ⬅ tambahkan null di sini
  outlet_default?: {
    id: string;
    name: string | null;
    active: boolean;
  } | null;
  message?: string; // ⬅ tambahkan juga agar tidak merah TS
}



export const getUserProfile = async (
): Promise<UserProfileResponse> => {
  try {
    const res = await api.get(`/getUserProfile`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getUserProfile error:", err);
    return {
      success: false,
      profile: null,
      
      message: err?.response?.data?.message ?? "Gagal memuat profil"
    };
  }
};
