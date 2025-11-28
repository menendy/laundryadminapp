// hooks/UniversalPaginatedList.ts (FINAL FIX + SNACKBAR WORKING)

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSnackbarStore } from "../store/useSnackbarStore";
import { handleBackendError } from "../utils/handleBackendError";

export type FetchResult<T> = {
  data: T[];
  nextCursor?: string | null;
};

export interface UniversalPaginatedOptions<T, M extends string> {
  modul: string;
  pathname: string;
  limit?: number;
  defaultMode: M;
  fetchFn: (
    modul: string,
    pathname: string,
    search: string | null,
    cursor: string | null,
    limit: number,
    mode: M
  ) => Promise<FetchResult<T>>;
}

export function useUniversalPaginatedList<T, M extends string>({
  modul,
  pathname,
  limit = 10,
  defaultMode,
  fetchFn,
}: UniversalPaginatedOptions<T, M>) {
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [items, setItems] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<M>(defaultMode);
  const [cursor, setCursor] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const didInitialLoad = useRef(false);
  const fetchLock = useRef(false);
  const endReachedLock = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastThrottleTime = useRef(0);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeFetch = useCallback(
    async (
      reset: boolean = false,
      passedSearch: string = "",
      passedCursor: string | null = null
    ) => {
      if (error) return;
      if (fetchLock.current || !isMounted.current) return;

      fetchLock.current = true;
      setLoading(true);

      try {
        const result = await fetchFn(
          modul,
          pathname,
          passedSearch?.trim() || null,
          reset ? null : passedCursor,
          limit,
          mode
        );

        if (!isMounted.current) return;

        const ok = handleBackendError(result as any, () => { }, showSnackbar);
        if (!ok) {
          setError(true);
          setHasMore(false);
          setRefreshing(false);
          return;
        }

        const data = result.data ?? [];

        setItems((prev) => {
          const merged = reset ? data : [...prev, ...data];
          const map = new Map(
            merged.map((i: any) => [
              i.id || i._id || Math.random().toString(),
              i,
            ])
          );
          return [...map.values()] as T[];
        });

        setCursor(result.nextCursor ?? null);
        setHasMore(!!result.nextCursor);
      } catch (err: any) {
        setError(true);

        // Ambil pesan API jika tersedia
        const apiMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat data dari server";

          showSnackbar(apiMessage, "error");
          setHasMore(false);
      } finally {
        fetchLock.current = false;
        if (isMounted.current) setLoading(false);
      }
    },
    [modul, pathname, mode, limit, fetchFn, showSnackbar, error]
  );

  // Initial Load
  useEffect(() => {
    if (error) return;
    if (didInitialLoad.current) return;

    didInitialLoad.current = true;
    safeFetch(true, search, null);

    setTimeout(() => {
      endReachedLock.current = false;
    }, 300);
  }, [error]);

  // Debounce Search
  useEffect(() => {
    if (!didInitialLoad.current || error) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      safeFetch(true, search, null);
    }, 450);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, safeFetch]);

  // Mode Change
  useEffect(() => {
    if (!didInitialLoad.current || error) return;
    setCursor(null);
    safeFetch(true, search, null);
  }, [mode]);

  // Refresh
  const onRefresh = async () => {
    setError(false);
    setRefreshing(true);
    endReachedLock.current = true;
    setCursor(null);

    await safeFetch(true, search, null);

    setTimeout(() => {
      endReachedLock.current = false;
      setRefreshing(false);
    }, 200);
  };

  // Pagination
  const onEndReached = async () => {
    const now = Date.now();
    if (now - lastThrottleTime.current < 700) return;
    lastThrottleTime.current = now;

    if (!hasMore || loading || error || endReachedLock.current) return;

    await safeFetch(false, search, cursor);
  };

  return {
    items,
    search,
    setSearch,
    mode,
    setMode,
    loading,
    refreshing,
    hasMore,
    onRefresh,
    onEndReached,
  };
}
