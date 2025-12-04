// hooks/UniversalPaginatedList.ts (WITH SCREEN FOCUS FIX)

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useFocusEffect } from "expo-router";
import { useSnackbarStore } from "../store/useSnackbarStore";
import { handleBackendError } from "../utils/handleBackendError";

export type FetchResult<T> = {
  data: T[];
  nextCursor?: string | null;
};

export interface UniversalPaginatedOptions<T, M extends string> {
  rootPath: string;
  basePath: string;
  limit?: number;
  defaultMode: M;
  fetchFn: (
    rootPath: string,
    basePath: string,
    search: string | null,
    cursor: string | null,
    limit: number,
    mode: M
  ) => Promise<FetchResult<T>>;
}

export function useUniversalPaginatedList<T, M extends string>({
  rootPath,
  basePath,
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

  const focusedRef = useRef(false);
  const fetchLock = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastThrottleTime = useRef(0);

  const safeFetch = useCallback(
    async (
      reset: boolean = false,
      passedSearch: string = "",
      passedCursor: string | null = null
    ) => {
      if (error) return;
      if (!focusedRef.current) return; // 🔥 only fetch if screen active
      if (fetchLock.current) return;

      fetchLock.current = true;
      setLoading(true);

      try {
        const result = await fetchFn(
          rootPath,
          basePath,
          passedSearch?.trim() || null,
          reset ? null : passedCursor,
          limit,
          mode
        );

        const ok = handleBackendError(result as any, () => { }, showSnackbar);
        if (!ok) {
          setError(true);
          setHasMore(false);

          // 🚫 Stop fetching loop kalau 403 Forbidden dari RBAC
          if ((result as any)?.status === 403) {
            fetchLock.current = true; // 🔒 block fetch selanjutnya
          }

          return;
        }

        const data = result.data ?? [];

        setItems((prev) => (reset ? data : [...prev, ...data]));
        setCursor(result.nextCursor ?? null);

        // 🚫 Jika fetch awal menghasilkan data kosong → hentikan pagination
        if (reset && data.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(result.nextCursor !== null);
        }

        setError(false);

      } catch (err: any) {
        setError(true);

        showSnackbar(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat data dari server",
          "error"
        );

        setHasMore(false);
      } finally {
        fetchLock.current = false;
        setLoading(false);
      }
    },
    [rootPath, basePath, mode, limit, fetchFn, showSnackbar, error]
  );

  // 🔥 Detect Screen Focus — Expo Router
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;

      // Reload hanya saat screen baru fokus & bukan search
      if (!error && items.length === 0 && !loading && hasMore && search.trim() === "") {

        setError(false);
        setCursor(null);
        safeFetch(true, "", null); // ✅ pakai "" bukan null
      }

      return () => {
        focusedRef.current = false;
      };
    }, [items.length, loading, search, safeFetch])
  );

  // 🔄 Search Debounce
  useEffect(() => {
    if (!focusedRef.current) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      safeFetch(true, search, null);
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, safeFetch]);

  // 🔄 Mode change refresh
  useEffect(() => {
    if (!focusedRef.current) return;
    if (search.trim() !== "") return; // ❗ jangan ganggu ketika user sedang search

    setCursor(null);
    safeFetch(true, "", null); // ✅ pakai "" bukan null
  }, [mode, search, safeFetch]);

  // 🔄 Pull to Refresh
  const onRefresh = async () => {
    if (!focusedRef.current) return;
    setRefreshing(true);
    setError(false);
    setCursor(null);

    await safeFetch(true, search, null);

    setRefreshing(false);
  };

  // ⬇️ Infinite Scroll — Only if focused
  const onEndReached = async () => {
    if (!focusedRef.current) return;

    const now = Date.now();
    if (now - lastThrottleTime.current < 700) return;
    lastThrottleTime.current = now;

    if (!hasMore || loading || error) return;

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
