import { api } from "./client";

export interface OwnerPayload {
  
}

export interface OwnerResponse {
  success?: boolean;
  id?: string;
  message?: string;
  errors?: { field: string; message: string }[];
}

export interface OwnerListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
  message?: string;
  status?: number;
}

export const getOwnerList = async (
   rootPath: string,                   
    basePath: string,                    
    search: string | null = null,
    cursor: string | null = null,
    limit = 10,
    mode: "nama" | "telp" | "email" = "nama"
  ): Promise<OwnerListResponse> => {
    try {
      const params = new URLSearchParams();
  
      params.append("rootPath", rootPath);
      params.append("basePath", basePath);
  
      if (search) params.append("search", search);
      if (cursor) params.append("cursor", cursor);
      params.append("limit", limit.toString());
      params.append("mode", mode);
  
      const res = await api.get(`/getOwnerList?${params.toString()}`);
  
      return res.data;
  
    } catch (err: any) {
      console.error("❌ getOwnerList error:", err);
  
      return {
        success: false,
        data: [],
        message: err?.response?.data?.message || "Gagal memuat data",
        status: err?.response?.status || 500
      };
    }
};

export const addOwner = async (payload: OwnerPayload): Promise<OwnerResponse> => {
  const res = await api.post("/addOwner", payload);
  return res.data;
};


export interface OwnerLiteResponse {
  success: boolean;
  data: { id: string; name: string }[];
}

export const getOwnerListLite = async (): Promise<OwnerLiteResponse> => {
  try {
    const res = await api.get("/getOwnerListLite");
    return res.data;
  } catch (err) {
    console.error("❌ getOwnerListLite error:", err);
    return { success: false, data: [] };
  }
};

export const getOwnerById = async (id: string,rootPath: string, basePath: string) => {
 const res = await api.get("/getOwnerDetail", { params: {id,rootPath,basePath} });
 return res.data?.data ?? null;
};

export const updateOwner = async (
  id: string,
  payload: OwnerPayload
) => {
  const res = await api.put(`/updateOwner?id=${id}`, payload);
  return res.data;
};
