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
  message: string;
  profile: {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    role_id_default?: string;
    owner_id_default?: string;
    outlet_id_default?: string;
  } | null;
}

export const getUserProfile = async (
  modul: string,
  path: string
): Promise<UserProfileResponse> => {
  try {
    const res = await api.get(
      `/getUserProfile?modul=${encodeURIComponent(modul)}&path=${encodeURIComponent(path)}`
    );
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
