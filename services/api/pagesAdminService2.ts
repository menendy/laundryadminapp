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
  

  active: boolean;
  can_view_by: string[];

  permissions_type?: { [key: string]: string };
  useRole?: boolean;
  icon?: string;
  children?: PageAdminItem[];
}

export interface PagesAdminList2Response {
  success: boolean;
  data: PageAdminItem[];
  message?: string;
  status?: number;
  
}

/* ================= API ================= */

export const getPagesAdminList2 = async (
  rootPath?: string, 
  basePath?: string
): Promise<PagesAdminList2Response> => {
  
  // Masukkan ke dalam params agar menjadi query string:
  // /getPagesAdminList2?rootPath=...&basePath=...
  const res = await api.get("/getPagesAdminList2", { 
    params: { 
      rootPath, 
      basePath 
    } 
  });
  
  return res.data;
};



// === SAVE STRUCTURE (BULK) ===
export const savePagesAdminStructure = async (items: PageAdminItem[]) => {
  // Kita perlu membersihkan data sebelum dikirim (hapus children nested agar payload ringan)
  // Backend hanya menerima Flat List
  const sanitizedItems = items.map((item) => {
    const { children, ...rest } = item;
    return rest;
  });

  const res = await api.post("/addPagesAdmin2", { items: sanitizedItems });
  return res.data;
};
