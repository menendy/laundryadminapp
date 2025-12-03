import { api } from "./client";


export interface SysadminPayload {
 
}

export interface SysadminResponse {
  success?: boolean;
  id?: string;
  message?: string;
  field?: string | null;
  status?: number;
  errors?: { field: string | null; message: string }[];
}

export const addSysadmin = async (payload: SysadminPayload): Promise<SysadminResponse> => {
  try {
    const res = await api.post("/addSysadmin", payload);
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

export interface SysadminListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
  message?: string;
  status?: number;
}

export const getSysadminList = async (
  rootPath: string,                   
  basePath: string,                    
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "semua" | "nama" | "telp" = "semua"
): Promise<SysadminListResponse> => {
  try {
    const params = new URLSearchParams();

    params.append("rootPath", rootPath);
    params.append("basePath", basePath);

    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());
    params.append("mode", mode);

    const res = await api.get(`/getSysadminList?${params.toString()}`);

    return res.data;

  } catch (err: any) {
    console.error("❌ getSysadminList error:", err);

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Gagal memuat data",
      status: err?.response?.status || 500
    };
  }
};
