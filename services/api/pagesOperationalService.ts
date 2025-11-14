import { api } from "./client";

export interface PageOperationalPayload {
  owner_id: string;
  name: string;
  path: string;
  component: string;
  sort: number;
  active: boolean;
  allowed_roles: string[];
  permissions: Record<string, string[]>;
}

export const addPageOperational = async (
  payload: PageOperationalPayload
) => {
  const res = await api.post("/addPagesOperational", payload);
  return res.data;
};

export const getPagesOperationalList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10
) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", String(limit));

    const res = await api.get(
      `/getPagesOperationalList?${params.toString()}`
    );

    return res.data;
  } catch (err) {
    console.error("❌ getPagesOperationalList error:", err);
    return { success: false, data: [] };
  }
};
