import { api } from "./client";

/* ------------------------------------------
   PAYLOAD untuk tambah outlet
-------------------------------------------*/
export interface OutletPayload {
  owner_id: string;
  group_id: string;
  name: string;
  address: string;
  phone: string;
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
}


export const getOutletList = async (
  search: string | null = null,
  cursor: string | null = null,
  limit = 10
): Promise<OutletListResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());

    const res = await api.get(`/getOutletList?${params.toString()}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getOutletList error:", err);
    return { success: false, data: [] };
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
