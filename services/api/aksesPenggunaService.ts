import { api } from "./client";

export interface AksesPenggunaPayload {

}


export const addAksesPengguna = async (payload: AksesPenggunaPayload) => {
  const res = await api.post("/addAksesPengguna", payload);
  return res.data;
}



// ============================================================
// 🟢 PAGE ADMIN LIST ALL

export const getPagesAdminListAll = async (): Promise<any[]> => {

  try {
    
    const params = new URLSearchParams();
    
    const res = await api.get(`/getPagesAdminListAll?${params.toString()}`);
     return res.data?.data ?? []; 

  } catch (err) {
    console.error("❌ getPagesAdminListAll error:", err);
    return [];

  }
};

export interface AksesAdminListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
  message?: string;
  status?: number;
}

export const getAksesAdminList = async (
  modul: string,
  pagePath: string,
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "semua" | "name" | "path" | "component" = "semua"
): Promise<AksesAdminListResponse> => {

  const params = new URLSearchParams();

  params.append("modul", modul);
  params.append("path", pagePath);

  if (search) params.append("search", search);
  if (cursor) params.append("cursor", cursor);

  params.append("limit", limit.toString());
  params.append("mode", mode);

  const res = await api.get(`/getRoleList?${params.toString()}`);
  return res.data;     // 🟢 jika success langsung return
};

export interface PermissionItem {
  page_id: string;
  actions: string[]; // misalnya: ["view", "create", "edit", "delete"]
}

// =============================
// 🔹 GET BY ID (untuk EDIT / preload)
// =============================
export const getAksesPenggunaById = async (roleId: string, path: string) => {
  //const normalizedPath = pagePath;
  const res = await api.get("/getAksesPenggunaById", {
    params: {
      roleId,
      path
    }
  });

  return res.data?.data ?? null;
};


// =============================
// 🔹 UPDATE
// =============================
export const updateAksesPengguna = async (
  roleId: string,
  payload: AksesPenggunaPayload
) => {
  const res = await api.put(`/updateAksesPengguna?roleId=${roleId}`, payload);
  return res.data;
};