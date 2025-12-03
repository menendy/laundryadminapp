// hooks/UniversalPaginatedList.ts (FULL FIX 403 LOOP)

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
      if (fetchLock.current) return;
      if (!focusedRef.current) return;
      if (error) return;

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

        const ok = handleBackendError(result as any, () => {}, showSnackbar);

        if (!ok) {
          const r: any = result;
          setError(true);
          setHasMore(false);

          // ⛔ Stop full pagination jika 403 ACCESS DENIED
          if (r?.status === 403) {
            fetchLock.current = true;
            setItems([]); // Kosongkan supaya user tau tidak ada akses
          }

          return;
        }

        const data = result.data ?? [];

        setItems((prev) => (reset ? data : [...prev, ...data]));
        setCursor(result.nextCursor ?? null);
        setHasMore(!!result.nextCursor);

      } catch (err: any) {
        setError(true);
        setHasMore(false);

        showSnackbar(
          err?.response?.data?.message ||
            err?.message ||
            "Gagal memuat data dari server",
          "error"
        );

      } finally {
        setLoading(false);

        // Jika bukan 403 → allow fetch ulang lagi
        if (!(error && fetchLock.current)) {
          fetchLock.current = false;
        }
      }
    },
    [rootPath, basePath, mode, limit, fetchFn, showSnackbar, error]
  );

  // 📌 Load saat screen FOCUS pertama kali — TAPI hanya jika tidak error
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;

      if (!error && items.length === 0 && !loading && search.trim() === "") {
        setCursor(null);
        safeFetch(true, "", null);
      }

      return () => {
        focusedRef.current = false;
      };
    }, [items.length, loading, search, safeFetch, error])
  );

  // 🔎 Search — TAPI hanya jika tidak error
  useEffect(() => {
    if (!focusedRef.current || error) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      safeFetch(true, search, null);
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, safeFetch, error]);

  // 🔄 Mode change — TAPI tidak override search atau error
  useEffect(() => {
    if (!focusedRef.current || error) return;
    if (search.trim() !== "") return;

    setCursor(null);
    safeFetch(true, "", null);
  }, [mode, search, safeFetch, error]);

  // 🔁 Manual refresh only
  const onRefresh = async () => {
    if (!focusedRef.current || error) return;
    setRefreshing(true);
    setCursor(null);

    await safeFetch(true, search, null);

    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (!focusedRef.current || loading || error) return;

    const now = Date.now();
    if (now - lastThrottleTime.current < 700) return;
    lastThrottleTime.current = now;

    if (!hasMore) return;

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
