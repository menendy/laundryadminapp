import { api } from "./client";

export interface PageAdminPayload {
 
  name: string;
  path: string;
  component: string;
  active: boolean;
  is_public: boolean;
  canViewBy: string[];
  permission_type: { [key: string]: string };
}

export const addPageAdmin = async (payload: PageAdminPayload) => {
  const res = await api.post("/addPagesAdmin", payload);
  return res.data;
};

export interface PermissionDiffItem {
  originalUrl: string;
  originalPermission: string;
  url: string;
  permission: string;
}

export interface SyncPermissionsDiff {
  update: PermissionDiffItem[];
}

export interface PageUpdateAdminPayload {
  id:string;
  name: string;
  path: string;
  component: string;
  active: boolean;
  is_public: boolean;
  canViewBy: string[];
  permission_type: { [key: string]: string };
  sync_permissions_diff: SyncPermissionsDiff;
}



export const updatePageAdmin = async (payload: PageUpdateAdminPayload) => {
  const res = await api.put("/updatePagesAdmin", payload);
  return res.data;
};

export const getPageAdminById = async (id: string) => {
  const res = await api.get(`/getPagesAdminDetail?id=${id}`);
  return res.data;
};


export interface PagesAdminListResponse {
  success: boolean;
  data: any[];
  nextCursor?: string | null;
  limit?: number;
  total?: number;
  message?: string;
  status?: number;
}

export const getPagesAdminList = async (
  modul: string,
  pagePath: string,
  search: string | null = null,
  cursor: string | null = null,
  limit = 10,
  mode: "semua" | "name" | "path" | "component" = "semua"
): Promise<PagesAdminListResponse> => {

  const params = new URLSearchParams();

  params.append("modul", modul);
  params.append("path", pagePath);

  if (search) params.append("search", search);
  if (cursor) params.append("cursor", cursor);

  params.append("limit", limit.toString());
  params.append("mode", mode);

  const res = await api.get(`/getPagesAdminList?${params.toString()}`);
  return res.data;     // 🟢 jika success langsung return
};
