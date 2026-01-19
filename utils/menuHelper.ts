// utils/menuHelper.ts
import { PageAdminItem } from "../services/api/pagesAdminService2";

// Tipe data yang dibutuhkan oleh DrawerMenu UI
export type DrawerMenuItem = {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: DrawerMenuItem[];
  // 👇 Opsional: Tambahkan ini jika UI Drawer Anda ingin memberi warna beda untuk item non-aktif
  active?: boolean; 
};

export function transformMenuData(data: PageAdminItem[]): DrawerMenuItem[] {
  if (!data || !Array.isArray(data)) return [];

  // 1. HAPUS FILTER ACTIVE, Cukup sort saja
  const sortedData = [...data]
    // .filter((item) => item.active) // ❌ HAPUS BARIS INI
    .sort((a, b) => a.sort - b.sort);

  const map: Record<string, DrawerMenuItem> = {};
  const roots: DrawerMenuItem[] = [];

  // 2. Mapping data API ke struktur DrawerMenuItem
  sortedData.forEach((item) => {
    map[item.id] = {
      key: item.id,
      label: item.name,           
      icon: item.icon,            
      path: item.type === "page" ? item.path : undefined,
      children: [],
      // 👇 Teruskan status active agar UI tahu (opsional)
      active: item.active 
    };
  });

  // 3. Susun Relasi Parent-Child
  sortedData.forEach((item) => {
    const node = map[item.id];
    
    // Cek apakah punya parent_id dan parent-nya valid
    // NOTE: Jika Parent active=false tapi Child active=true, 
    // Child tetap akan muncul jika logika UI Drawer Anda mengizinkan expand parent non-aktif.
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}