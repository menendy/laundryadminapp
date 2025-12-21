import { api } from "./client";

export interface AksesPenggunaPayload {

}


export const addAksesPengguna = async (payload: AksesPenggunaPayload) => {
  const res = await api.post("/addAksesPengguna", payload);
  return res.data;
}



// ============================================================
// 🟢 PAGE ADMIN LIST ALL

// export const getPagesAdminListAll = async (): Promise<any[]> => {

//   try {

//     const params = new URLSearchParams();

//     const res = await api.get(`/getPagesAdminListAll?${params.toString()}`);
//     return res.data?.data ?? [];

//   } catch (err) {
//     console.error("❌ getPagesAdminListAll error:", err);
//     return [];

//   }
// };


// export const getPagesAdminListAll = async (rootPath: string, basePath: string) => {
//  const res = await api.get("/getPagesAdminListAll", { params: {rootPath,basePath} });
//  return res.data?.data ?? null;
// };

export const getPagesAdminListAll = async (
  rootPath: string,      // wajib agar sesuai dengan hook
  basePath: string,      // wajib juga
  search: string | null = null,
  cursor: string | null = null,
  limit = 20,
   
) => {
  try {
    const params = new URLSearchParams();

    params.append("rootPath", rootPath);
    params.append("basePath", basePath);

    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);

    params.append("limit", limit.toString());
    

    const res = await api.get(`/getPagesAdminListAll?${params.toString()}`);

    return {
      success: res.data.success,
      data: res.data.data,     // <─ hook butuh "data"
    };
  } catch (err) {
    console.error("❌ getPagesAdminListAll error:", err);
    return { success: false, data: [] };
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
  rootPath: string,
  basePath: string,
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "name" 
): Promise<AksesAdminListResponse> => {

  const params = new URLSearchParams();

  params.append("rootPath", rootPath);
  params.append("basePath", basePath);

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
export const getAksesPenggunaById = async (roleId: string, rootPath: string, basePath: string) => {
  //const normalizedPath = pagePath;
  const res = await api.get("/getAksesPenggunaById", { params: { roleId, rootPath, basePath } });
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

export const deleteAksesPengguna = async (
  AksesPenggunaId: string,
  payload: AksesPenggunaPayload,
 
) => {
  const body = {
    AksesPenggunaId,
    ...payload,
    
  };

  const res = await api.post("/deleteAksesPengguna", body);
  return res.data;
};
