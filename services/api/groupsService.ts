import { api } from "./client";

export interface GroupPayload {
  owner_id: string;
  name: string;
  description: string;
}

export interface GroupResponse {
  success?: boolean;
  id?: string;
  message?: string;
  errors?: { field: string; message: string }[];
}

export interface GroupListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
}

export const getGroupList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10
): Promise<GroupListResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());

    const res = await api.get(`/getGroupList?${params.toString()}`);
    return res.data;
  } catch (err) {
    console.error("❌ getGroupList error:", err);
    return { success: false, data: [] };
  }
};

export const addGroup = async (
  payload: GroupPayload
): Promise<GroupResponse> => {
  const res = await api.post("/addGroup", payload);
  return res.data;
};

/* ------------------------------------------
   GROUP LIST LITE (dropdown)
-------------------------------------------*/
export const getGroupListLite = async (ownerId: string) => {
  try {
    const params = new URLSearchParams();
    params.append("owner_id", ownerId);

    const res = await api.get(`/getGroupListLite?${params.toString()}`);
    return res.data.data; // array: [{id, name}]
  } catch (err) {
    console.error("❌ getGroupListLite error:", err);
    return [];
  }
};
