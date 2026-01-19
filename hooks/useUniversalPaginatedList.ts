import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
// 1. 🔥 IMPORT usePathname
import { useFocusEffect, usePathname } from "expo-router"; 
import { useIsFocused } from "@react-navigation/native"; 

import { useSnackbarStore } from "../store/useSnackbarStore";
import { handleBackendError } from "../utils/handleBackendError";
import { useAuthStore } from "../store/useAuthStore";

export function useUniversalPaginatedList<T, M extends string>({
  rootPath: initialRootPath,
  basePath: initialBasePath,
  limit = 10,
  defaultMode,
  fetchFn,
}: any) {
  const queryClient = useQueryClient();
  const isFocused = useIsFocused(); 
  const pathname = usePathname(); // ✅ 2. Ambil URL saat ini
  
  const { user, isHydrated } = useAuthStore();

  const lockedRootPath = useRef(initialRootPath).current;
  const lockedBasePath = useRef(initialBasePath).current;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mode, setMode] = useState<M>(defaultMode);
  
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // ✅ 3. VALIDASI URL STRICT
  // Logika: Fetch hanya boleh jalan jika URL aplikasi mengandung basePath halaman ini.
  // Contoh: Jika saya halaman "Outlet" (basePath='outlets'), tapi URL sekarang '/' (Dashboard),
  // maka isRouteMatch = false. Request DIBLOKIR total.
  const isRouteMatch = useMemo(() => {
    if (!pathname || !lockedBasePath) return false;
    // Bersihkan slash awal/akhir agar pencocokan akurat
    const cleanPath = pathname.replace(/^\/|\/$/g, ''); 
    const cleanBase = lockedBasePath.replace(/^\/|\/$/g, '');
    return cleanPath.includes(cleanBase);
  }, [pathname, lockedBasePath]);

  const queryKey = useMemo(() => {
    return [lockedBasePath, mode, debouncedSearch];
  }, [lockedBasePath, mode, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: queryKey, 
    queryFn: async ({ pageParam }) => {
      const result = await fetchFn(
        lockedRootPath, 
        lockedBasePath, 
        debouncedSearch || null, 
        pageParam, 
        limit, 
        mode
      );
      const ok = handleBackendError(result as any, () => {}, showSnackbar);
      if (!ok) throw new Error(result.message || "Terjadi kesalahan");
      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    
    // 🔥 4. ULTRA STRICT ENABLED RULE
    enabled: 
        !!lockedBasePath && 
        isHydrated && 
        !!user && 
        isFocused &&      // Layar harus fokus (visual)
        isRouteMatch,     // URL harus cocok (logic) - INI KUNCINYA

    //staleTime: Infinity,
    //refetchOnMount: false,
    retry: false, 
  });

  const isFirstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      
      // Manual refetch hanya jika user Login + Fokus + URL Cocok
      if (isFocused && !!user && isRouteMatch) {
         queryClient.invalidateQueries({ queryKey: queryKey, type: 'active' });
      }
      
    }, [queryKey, isFocused, !!user, isRouteMatch]) 
  );

  const items = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data) ?? [];
  }, [query.data]);

  return {
    items,
    search,
    setSearch,
    mode,
    setMode,
    loading: query.isLoading || query.isFetchingNextPage,
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    hasMore: !!query.hasNextPage,
    
    onRefresh: () => queryClient.resetQueries({ queryKey }), 
    
    onEndReached: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
    },
    error: query.error,
  };
}