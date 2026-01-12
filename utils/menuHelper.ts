// utils/menuHelper.ts
import { PageAdminItem } from "../services/api/pagesAdminService2";

// Tipe data yang dibutuhkan oleh DrawerMenu UI
export type DrawerMenuItem = {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: DrawerMenuItem[];
};

export function transformMenuData(data: PageAdminItem[]): DrawerMenuItem[] {
  if (!data || !Array.isArray(data)) return [];

  // 1. Filter active & sort berdasarkan field 'sort'
  const sortedData = [...data]
    .filter((item) => item.active)
    .sort((a, b) => a.sort - b.sort);

  const map: Record<string, DrawerMenuItem> = {};
  const roots: DrawerMenuItem[] = [];

  // 2. Mapping data API ke struktur DrawerMenuItem
  sortedData.forEach((item) => {
    map[item.id] = {
      key: item.id,
      label: item.name,           // API: name -> UI: label
      icon: item.icon,            
      path: item.type === "page" ? item.path : undefined,
      children: [],
    };
  });

  // 3. Susun Relasi Parent-Child
  sortedData.forEach((item) => {
    const node = map[item.id];
    
    // Cek apakah punya parent_id dan parent-nya valid
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children?.push(node);
    } else {
      // Jika tidak punya parent atau parent tidak ditemukan -> jadi Root
      roots.push(node);
    }
  });

  return roots;
}