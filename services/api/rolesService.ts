import { api } from "./client";

export interface RolePayload {
  owner_id: string;
  name: string;
  description: string;
  type: "system" | "operational";
  app_access: string[];
}

export interface RoleResponse {
  success?: boolean;
  id?: string;
  message?: string;
  errors?: any[];
}

export interface RoleListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  total?: number;
}

export const getRoleList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10
): Promise<RoleListResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());

    const res = await api.get(`/getRoleList?${params.toString()}`);
    return res.data;
  } catch (err) {
    console.error("❌ getRoleList error:", err);
    return { success: false, data: [] };
  }
};

export const addRole = async (payload: RolePayload) => {
  const res = await api.post("/addRole", payload);
  return res.data;
};

export interface RoleTypesResponse {
  success: boolean;
  data: { id: string; label: string }[];
}


export const getRoleTypes = async(): Promise<RoleTypesResponse> => {
  try {
    const res = await api.get("/getRolesType");
    return res.data; // expect array of {id, label}
  } catch (err) {
    console.error("❌ getRoleType error:", err);
    return { success: false, data: [] };
  }
}

/* ------------------------------------------
   ROLE LIST LITE (dropdown)
-------------------------------------------*/
export const getRoleListLite = async (ownerId: string) => {
  try {
    const params = new URLSearchParams();
    params.append("owner_id", ownerId);

    const res = await api.get(`/getRoleListLite?${params.toString()}`);
    return res.data; // array: [{id, name}]
  } catch (err) {
    console.error("❌ getRoleListLite error:", err);
    return [];
  }
};
