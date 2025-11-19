import { useAccessStore } from "../store/useAccessStore";

export function usePageAccess(pageKey: string) {
  const pages = useAccessStore((s) => s.allowedPages);
  const perms = useAccessStore((s) => s.permissionsByPage[pageKey] || {});

  return {
    allowed: pages.includes(pageKey),
    perms,
  };
}
