// hooks/UniversalPaginatedList.ts — FINAL FIX

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
  const [fatalError, setFatalError] = useState(false);

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
      if (!focusedRef.current) return;
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
          setFatalError(true);
          if (reset) {
            setItems([]);
            setHasMore(false);
          }
          return;
        }

        const data = result.data ?? [];

        setItems((prev) => (reset ? data : [...prev, ...data]));
        setCursor(result.nextCursor ?? null);
        setHasMore(result.nextCursor !== null);

        setFatalError(false);

      } catch (err: any) {
        setFatalError(true);

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
    [rootPath, basePath, mode, limit, fetchFn, showSnackbar]
  );

  // 🔥 First load when screen focused
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;

      if (fatalError) {
        console.log("Abort fetch on focus: backend fatalError detected");
        return () => { focusedRef.current = false; };
      }

      setCursor(null);
      setItems([]);
      setHasMore(true);
      safeFetch(true, search, null);

      return () => {
        focusedRef.current = false;
      };
    },
      //[search, mode, fatalError, safeFetch])
      [mode, fatalError, safeFetch])
  );


  // 🔄 Search Debounce - user retry even after fatalError
  useEffect(() => {
    if (!focusedRef.current) return;

    // ❗ Perbaikan: Jangan reset fatalError saat search aktif
    if (!fatalError) {
      setHasMore(true);
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      safeFetch(true, search, null);
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, safeFetch]);  // deps tetap


  // 🔄 Mode change
  useEffect(() => {
    if (!focusedRef.current) return;
    if (search.trim() !== "") return; // Search sedang aktif → fetch ditangani debounce search

    setCursor(null);
    safeFetch(true, search, null);
  }, [mode, safeFetch]);


  const onRefresh = async () => {
    if (!focusedRef.current) return;

    setRefreshing(true);
    setFatalError(false);
    setCursor(null);
    await safeFetch(true, search, null);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (!focusedRef.current) return;

    const now = Date.now();
    if (now - lastThrottleTime.current < 700) return;
    lastThrottleTime.current = now;

    if (!hasMore || loading) return;

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
