import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { getPagesAdminList2, PageAdminItem } from "../../services/api/pagesAdminService2";
import { usePagesAdminDraftStore } from "../../store/usePagesAdminDraftStore.web";

export type TreeNode = PageAdminItem & {
  children: TreeNode[];
};

/* ================= HELPERS ================= */

function buildMenuTree(items: PageAdminItem[]): TreeNode[] {
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

  const [viewItems, setViewItems] = useState<PageAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const { drafts, updateSignal, setUpdateSignal } = usePagesAdminDraftStore();

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
  useEffect(() => {
    if (drafts.length > 0) {
      setViewItems(prev => {
        const newDrafts = drafts.filter(d => !prev.some(p => p.id === d.id));
        if (newDrafts.length === 0) return prev; 
        setDirty(true);
        return [...prev, ...newDrafts];
      });
    }
  }, [drafts]);

  /* ===== 3. HANDLE UPDATES (VIA STORE SIGNAL) ===== */
  useEffect(() => {
    if (!updateSignal) return;

    setViewItems(prev => {
        // 🔴 KASUS 1: HAPUS ITEM (MENU/PAGE) & ANAKNYA
        if (updateSignal.updatedType === "delete_item") {
            const getIdsToDelete = (parentId: string, allItems: PageAdminItem[]): string[] => {
                let ids = [parentId];
                const children = allItems.filter(i => i.parent_id === parentId);
                children.forEach(child => {
                    ids = [...ids, ...getIdsToDelete(child.id, allItems)];
                });
                return ids;
            };

            const idsToDelete = getIdsToDelete(updateSignal.updatedId, prev);
            return prev.filter(item => !idsToDelete.includes(item.id));
        }

        // 🔴 KASUS 2: HAPUS PERMISSION
        if (updateSignal.updatedType === "delete_permission") {
            return prev.map(item => {
                if (item.id !== updateSignal.updatedId) return item;
                const nextPermissions = { ...(item.permissions_type || {}) };
                delete nextPermissions[updateSignal.updatedUrl];
                return { ...item, permissions_type: nextPermissions };
            });
        }

        // 🔵 KASUS 3: EDIT EXISTING (Menu/Page/Permission Add/Edit)
        return prev.map(item => {
            if (item.id !== updateSignal.updatedId) return item;

            if (updateSignal.updatedType === "menu") {
                return { 
                    ...item, 
                    name: updateSignal.updatedValue,
                    // ✅ UPDATE ICON JIKA ADA PERUBAHAN
                    icon: updateSignal.updatedIcon || item.icon 
                };
            }
            
            if (updateSignal.updatedType === "page") {
                return { 
                    ...item, 
                    name: updateSignal.updatedName, 
                    icon: updateSignal.updatedIcon || item.icon,
                    path: updateSignal.updatedPath, 
                    component: updateSignal.updatedComponent 
                };
            }

            if (updateSignal.updatedType === "permission") {
                const nextPermissions = { ...(item.permissions_type || {}) };
                if (updateSignal.oldUrl && updateSignal.oldUrl !== updateSignal.updatedUrl) {
                    delete nextPermissions[updateSignal.oldUrl];
                }
                nextPermissions[updateSignal.updatedUrl] = updateSignal.updatedPermission;
                return { ...item, permissions_type: nextPermissions };
            }

            return item;
        });
    });

    setDirty(true);
    setUpdateSignal(null); 
  }, [updateSignal]);

  const tree = useMemo(() => buildMenuTree(viewItems), [viewItems]);

  return { items: viewItems, setItems: setViewItems, tree, loading, dirty, setDirty };
}