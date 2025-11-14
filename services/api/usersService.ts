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
