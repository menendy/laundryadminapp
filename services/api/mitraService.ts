import { api } from "./client";

export interface MitraPayload {
 
}

export interface MitraListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
  message?: string;
  status?: number;
}

export const getMitraList = async (
  rootPath: string,                   
  basePath: string,                    
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "nama" | "telp" | "email" = "nama"
): Promise<MitraListResponse> => {
  try {
    const params = new URLSearchParams();

    params.append("rootPath", rootPath);
    params.append("basePath", basePath);

    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());
    params.append("mode", mode);

    const res = await api.get(`/getMitraList?${params.toString()}`);

    return res.data;

  } catch (err: any) {
    console.error("❌ getMitraList error:", err);

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Gagal memuat data",
      status: err?.response?.status || 500
    };
  }
};



export interface MitraResponse {
  success?: boolean;
  id?: string;
  message?: string;
  field?: string | null;
  status?: number;
  errors?: { field: string | null; message: string }[];
}


export interface MitraPayload {
 
}


export const addMitra = async (payload: MitraPayload) => {
  const res = await api.post("/addMitra_v2", payload);
  return res.data;
};


export const getMitraById = async (id: string,rootPath: string, basePath: string) => {
 const res = await api.get("/getMitraDetail", { params: {id,rootPath,basePath} });
 return res.data?.data ?? null;
};



export interface MitraPayload {

}

export const updateMitra = async (
  id: string,
  payload: MitraPayload
) => {
  const res = await api.put(`/updateMitra?id=${id}`, payload);
  return res.data;
};


export const updateMitraV2 = async (
  id: string,
  payload: MitraPayload
) => {
  const res = await api.put(`/updateMitrav2?id=${id}`, payload);
  return res.data;
};
