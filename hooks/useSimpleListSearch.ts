import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSnackbarStore } from "../store/useSnackbarStore";
import { handleBackendError } from "../utils/handleBackendError";

interface FetchResult<T> {
  data: T[];
  nextCursor?: string | null;
}

interface SimpleListOptions<T> {
  rootPath: string;
  basePath: string;
  limit?: number;
  fetchFn: (
    rootPath: string,
    basePath: string,
    search: string | null,
    cursor: string | null,
    limit: number
  ) => Promise<FetchResult<T>>;
}

export function useSimpleListSearch<T>({
  rootPath: initialRootPath,
  basePath: initialBasePath,
  fetchFn,
  limit = 25,
}: SimpleListOptions<T>) {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // ✅ KUNCI PATH: Agar logic tidak bocor saat navigasi
  const lockedRootPath = useRef(initialRootPath).current;
  const lockedBasePath = useRef(initialBasePath).current;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ✅ Search Debounce (350ms sesuai standar asli Anda)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // ✅ Query Key stabil (Modul + Keyword Search)
  const queryKey = [lockedBasePath, "simple-list", debouncedSearch];

  const query = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam }) => {
      const result = await fetchFn(
        lockedRootPath,
        lockedBasePath,
        debouncedSearch.trim() || null,
        pageParam as string | null,
        limit
      );

      // ✅ Penanganan Error Global
      const ok = handleBackendError(result as any, () => {}, showSnackbar);
      if (!ok) throw new Error("Gagal memuat data");

      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!lockedBasePath,
    
    // ✅ Dashboard logic: Data dianggap basi & dibuang saat unmount
    staleTime: 0,
    gcTime: 0,
    retry: 0,
  });

  // ✅ Transform data dari pages menjadi satu array flat
  const items = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data) ?? [];
  }, [query.data]);

  const clearSearch = () => setSearch("");

  return {
    items,
    search,
    setSearch,
    clearSearch,
    // Status Loading (First load atau fetching next page)
    loading: query.isLoading || query.isFetchingNextPage,
    // Status untuk Refresh (Pull-to-refresh)
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    hasMore: !!query.hasNextPage,
    
    // ✅ Load More logic
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },

    // ✅ Reload/Reset logic
    reload: () => queryClient.resetQueries({ queryKey }),
    
    error: query.error,
  };
}