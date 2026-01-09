import { useEffect, useMemo, useState } from "react";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { getPagesAdminList2, PageAdminItem } from "../../services/api/pagesAdminService2";
import { usePagesAdminDraftStore } from "../../store/usePagesAdminDraftStore.web";

export type TreeNode = PageAdminItem & {
  children: TreeNode[];
};

/* ================= HELPERS ================= */

function buildMenuTree(items: PageAdminItem[]): TreeNode[] {
  // 1. Deep Clone untuk memutus referensi agar aman saat mutasi
  const itemsMap = items.map(i => ({ ...i, children: [] as TreeNode[] }));
  const map = new Map<string, TreeNode>();
  
  itemsMap.forEach(item => {
    map.set(item.id, item);
  });

  const tree: TreeNode[] = [];

  itemsMap.forEach(node => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      tree.push(node);
    }
  });

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    nodes.forEach(n => sortTree(n.children));
  };

  sortTree(tree);
  return tree;
}

/* ================= STATE ================= */

export function usePagesAdminState() {
  const router = useRouter();
  const params = useGlobalSearchParams<any>();

  // State tunggal untuk UI (Server + Drafts)
  const [viewItems, setViewItems] = useState<PageAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const { drafts } = usePagesAdminDraftStore();

  /* ===== 1. FETCH SERVER DATA ===== */
  useEffect(() => {
    getPagesAdminList2()
      .then(res => {
        if (res.success) {
          setViewItems(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ===== 2. SYNC DRAFTS TO VIEW ITEMS ===== */
  // Ketika ada draft baru, masukkan ke viewItems jika belum ada
  useEffect(() => {
    if (drafts.length > 0) {
      setViewItems(prev => {
        // Cari draft yang belum ada di viewItems
        const newDrafts = drafts.filter(d => !prev.some(p => p.id === d.id));
        if (newDrafts.length === 0) return prev; // Tidak ada perubahan
        
        // Tambahkan draft ke list, set dirty
        setDirty(true);
        return [...prev, ...newDrafts];
      });
    }
  }, [drafts]);

  /* ===== 3. HANDLE UPDATES FROM MODAL ===== */
  useEffect(() => {
    if (!params.updatedType || !params.updatedId) return;

    setViewItems(prev =>
      prev.map(item => {
        if (item.id !== params.updatedId) return item;

        if (params.updatedType === "menu") {
          return { ...item, name: params.updatedValue };
        }
        // ... logic update lain (page/permission) sama seperti sebelumnya ...
        if (params.updatedType === "page") {
             return { ...item, name: params.updatedName, path: params.updatedPath, component: params.updatedComponent };
        }
        return item;
      })
    );

    setDirty(true);
    router.setParams({ updatedType: undefined, updatedId: undefined });
  }, [params]);

  // Tree selalu dibentuk dari viewItems yang sudah berisi Server + Drafts
  const tree = useMemo(() => buildMenuTree(viewItems), [viewItems]);

  return {
    items: viewItems, // Kembalikan viewItems sebagai 'items' utama
    setItems: setViewItems, // Expose setter untuk DND
    tree,
    loading,
    dirty,
    setDirty,
  };
}