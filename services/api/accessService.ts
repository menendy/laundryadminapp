import { api } from "./client";

export interface AccessPayload {
  user_id: string;
  owner_id: string;
  group_id?: string | null;
  outlet_id: string;
  roles: string[];
}

export interface AccessResponse {
  success?: boolean;
  id?: string;
  message?: string;
  status?: number;
  errors?: { field: string | null; message: string }[];
}

export interface AccessListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
}

/* -------------------------------
   ADD ACCESS
-------------------------------- */
export const addAccess = async (payload: AccessPayload): Promise<AccessResponse> => {
  const res = await api.post("/addAccess", payload);
  return res.data;
};

/* -------------------------------
   GET LIST
-------------------------------- */
export const getAccessList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10
): Promise<AccessListResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());

    const res = await api.get(`/getAccessList?${params.toString()}`);
    return res.data;
  } catch (err) {
    console.error("❌ getAccessList error:", err);
    return { success: false, data: [] };
  }
};

/* -------------------------------
   GET DETAIL
-------------------------------- */
export const getAccessDetail = async (id: string) => {
  const res = await api.get(`/getAccessDetail?id=${id}`);
  return res.data;
};
