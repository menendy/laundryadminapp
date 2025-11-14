import { api } from "./client";

export interface OwnerPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface OwnerResponse {
  success?: boolean;
  id?: string;
  message?: string;
  errors?: { field: string; message: string }[];
}

export interface OwnerListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  total?: number;
  limit?: number;
}

export const getOwnerList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10
): Promise<OwnerListResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());

    const res = await api.get(`/getOwnerList?${params.toString()}`);
    return res.data;
  } catch (err) {
    console.error("❌ getOwnerList error:", err);
    return { success: false, data: [] };
  }
};

export const addOwner = async (payload: OwnerPayload): Promise<OwnerResponse> => {
  const res = await api.post("/addOwner", payload);
  return res.data;
};


export interface OwnerLiteResponse {
  success: boolean;
  data: { id: string; name: string }[];
}

export const getOwnerListLite = async (): Promise<OwnerLiteResponse> => {
  try {
    const res = await api.get("/getOwnerListLite");
    return res.data;
  } catch (err) {
    console.error("❌ getOwnerListLite error:", err);
    return { success: false, data: [] };
  }
};
