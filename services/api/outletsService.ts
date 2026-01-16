import { api } from "./client";

/* ------------------------------------------
   PAYLOAD untuk tambah outlet
-------------------------------------------*/
export interface OutletPayload {

}

/* ------------------------------------------
   RESPONSE interface
-------------------------------------------*/
export interface OutletResponse {
  success?: boolean;
  id?: string;
  message?: string;
  field?: string | null;
  status?: number;
  errors?: { field: string | null; message: string }[];
}

/* ------------------------------------------
   LIST RESPONSE utk halaman OUTLET
-------------------------------------------*/
export interface OutletListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
  message?: string;
  status?: number;
}


export const getOutletList = async (
  rootPath: string,
  basePath: string,
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "name" = "name"
): Promise<OutletListResponse> => {
  try {
    const params = new URLSearchParams();

    params.append("rootPath", rootPath);
    params.append("basePath", basePath);

    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);

    params.append("limit", limit.toString());
    params.append("mode", mode);

    const res = await api.get(`/getOutletList?${params.toString()}`);

    // 🔥 Tambahan: Cek manual jika success false tapi status 200
    if (res.data && res.data.success === false) {
       return {
         success: false,
         data: [],
         message: res.data.message || "Terjadi kesalahan pada server",
         status: 200
       };
    }

    return res.data;

  } catch (err: any) {
    console.error("❌ getOutletList error:", err);

    // 🔥 TANGKAP ERROR (Pola Benchmark)
    // Ini yang membuat pesan error muncul di Snackbar lewat Hook
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Gagal memuat data outlet",
      status: err?.response?.status || 500
    };
  }
};


export const addOutlet = async (
  payload: OutletPayload
): Promise<OutletResponse> => {
  const res = await api.post("/addOutlet", payload);
  return res.data;
};

/* ------------------------------------------
   OUTLET LIST LITE (dropdown)
-------------------------------------------*/
export const getOutletListLite = async (ownerId: string) => {
  try {
    const params = new URLSearchParams();
    params.append("owner_id", ownerId);

    const res = await api.get(`/getOutletListLite?${params.toString()}`);
    return res.data; // array: [{id, name}]
  } catch (err) {
    console.error("❌ getOutletListLite error:", err);
    return [];
  }
};

export interface OutletsByUserListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
  message?: string;
  status?: number;
}


export const getOutletsByUser = async (
  rootPath: string,
  basePath: string,
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "semua" | "name" | "path" | "component" = "semua"
): Promise<OutletsByUserListResponse> => {

  const params = new URLSearchParams();

  params.append("rootPath", rootPath);
  params.append("basePath", basePath);

  if (search) params.append("search", search);
  if (cursor) params.append("cursor", cursor);

  params.append("limit", limit.toString());
  params.append("mode", mode);

  const res = await api.get(`/getOutletUser?${params.toString()}`);
  return res.data;     // 🟢 jika success langsung return
};

export const getOutletById = async (id: string,rootPath: string, basePath: string) => {
   const res = await api.get("/getOutletDetail", { params: {id,rootPath,basePath} });
 return res.data?.data ?? null;
};

export interface OutletPayload {

}

export const updateOutlet = async (
  id: string,
  payload: OutletPayload
) => {
  const res = await api.put(`/updateOutlet?id=${id}`, payload);
  return res.data;
};

/* ------------------------------------------
   SET OUTLET (default / active outlet)
-------------------------------------------*/
export interface SetOutletPayload {
  rootPath: string,
  basePath: string,
  outlet_id: string;
  owner_id: string;
  role_id?: string;
}

export const setOutlet = async (
  payload: SetOutletPayload
): Promise<OutletResponse> => {
  const res = await api.post("/setOutlet", payload);
  return res.data;
};
