import { api } from "./client";

export interface PageAdminPayload {
  owner_id: string;
  name: string;
  path: string;
  component: string;
  sort: number;
  active: boolean;
  allowed_roles: string[];
  permissions: Record<string, string[]>;
}

export const addPageAdmin = async (payload: PageAdminPayload) => {
  const res = await api.post("/addPagesAdmin", payload);
  return res.data;
};

export const getPagesAdminList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10
) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", String(limit));

    const res = await api.get(`/getPagesAdminList?${params.toString()}`);
    return res.data;
  } catch (err) {
    console.error("❌ getPagesAdminList error:", err);
    return { success: false, data: [] };
  }
};
