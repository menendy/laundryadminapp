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

export const getSysadminById = async (id: string) => {
  const res = await api.get(`/getSysadminDetail?id=${id}`);
  return res.data;
};

export interface UpdateSysadminPayload {

}


// export const updateSysadmin = async (payload: UpdateSysadminPayload) => {
//   const res = await api.put("/updateSysadmin", payload);
//   return res.data;
// };

export const updateSysadmin = async (
  id: string,
  payload: UpdateSysadminPayload
) => {
  const res = await api.put(`/updateSysadmin?id=${id}`, payload);
  return res.data;
};

export const deleteSysadmin = async (
  sysadminId: string,
  payload: UpdateSysadminPayload
) => {
  const body = {
    sysadminId,
    ...payload
  };

  const res = await api.post("/deleteSysadmin", body);
  return res.data;
};