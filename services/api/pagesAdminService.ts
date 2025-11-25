import { api } from "./client";

export interface PageAdminPayload {
 
  name: string;
  path: string;
  component: string;
  active: boolean;
  canViewBy: string[];
  permission_type: { [key: string]: string };
}

export const addPageAdmin = async (payload: PageAdminPayload) => {
  try {
    const res = await api.post("/addPagesAdmin", payload);
    return res.data;  // success
  } catch (err: any) {
    // ---- PATCH PALING PENTING ----
    return err?.response?.data || {
      success: false,
      message: "Gagal mengirim data",
      status: err?.response?.status || 500,
      errors: []
    };

  }
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
