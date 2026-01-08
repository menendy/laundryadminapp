// services/api/pagesAdminService2.ts
import { api } from "./client";

/* ================= TYPES ================= */

export interface PageAdminItem {
  id: string;

  name: string;
  path: string;
  component: string;

  parent_id: string | null;
  level: number;
  sort: number;

  type: "menu" | "page";
  is_expandable: boolean;

  active: boolean;
  can_view_by: string[];

  permissions_type?: { [key: string]: string };
  useRole?: boolean;
}

export interface PagesAdminList2Response {
  success: boolean;
  data: PageAdminItem[];
  message?: string;
  status?: number;
}

/* ================= API ================= */

export const getPagesAdminList2 = async (): Promise<PagesAdminList2Response> => {
  const res = await api.get("/getPagesAdminList2");
  return res.data;
};
