// app/pages_admin2/state.ts
import { useEffect, useMemo, useState } from "react";
import {
  useRouter,
  useGlobalSearchParams,
} from "expo-router";

import {
  getPagesAdminList2,
  PageAdminItem,
} from "../../services/api/pagesAdminService2";
import { usePagesAdminDraftStore } from "../../store/usePagesAdminDraftStore.web";

/* ================= TYPES ================= */

export type TreeNode = PageAdminItem & {
  children: TreeNode[];
};

/* ================= HELPERS ================= */

function buildMenuTree(items: PageAdminItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();

  items.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  const tree: TreeNode[] = [];

  items.forEach(item => {
    const node = map.get(item.id)!;
    if (item.parent_id) {
      map.get(item.parent_id)?.children.push(node);
    } else {
      tree.push(node);
    }
  });

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort);
    nodes.forEach(n => sortTree(n.children));
  };

  sortTree(tree);
  return tree;
}

/* ================= STATE ================= */

export function usePagesAdminState() {
  const router = useRouter();
  const params = useGlobalSearchParams<any>();

  const [items, setItems] = useState<PageAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const { drafts } = usePagesAdminDraftStore();

  /* ===== FETCH ===== */
  useEffect(() => {
    getPagesAdminList2()
      .then(res => res.success && setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  /* ===== APPLY UPDATE FROM MODAL ===== */
  useEffect(() => {
    if (!params.updatedType || !params.updatedId) return;

    setItems(prev =>
      prev.map(item => {
        if (item.id !== params.updatedId) return item;

        if (params.updatedType === "menu") {
          return { ...item, name: params.updatedValue };
        }

        if (params.updatedType === "page") {
          return {
            ...item,
            name: params.updatedName,
            path: params.updatedPath,
            component: params.updatedComponent,
          };
        }

        if (params.updatedType === "permission") {
          const next = { ...(item.permissions_type || {}) };
          delete next[params.oldUrl];
          next[params.updatedUrl] = params.updatedPermission;
          return { ...item, permissions_type: next };
        }

        return item;
      })
    );

    setDirty(true);

    router.setParams({
      updatedType: undefined,
      updatedId: undefined,
      updatedValue: undefined,
      updatedName: undefined,
      updatedPath: undefined,
      updatedComponent: undefined,
      updatedPermission: undefined,
      updatedUrl: undefined,
      oldUrl: undefined,
    });
  }, [params]);

  /* ===== DIRTY FROM DRAFT ===== */
  useEffect(() => {
    if (drafts.length > 0) setDirty(true);
  }, [drafts.length]);

  // Gabungkan items dan drafts agar menu baru memiliki ID yang valid di dnd-kit
  const allFlattenedItems = useMemo(() => [...items, ...drafts], [items, drafts]);

  const tree = useMemo(
    () => buildMenuTree(allFlattenedItems),
    [allFlattenedItems]
  );

  return {
    items: allFlattenedItems, 
    tree,
    loading,
    dirty,
    setDirty,
    setItems,
  };
}