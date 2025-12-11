import { useState, useEffect, useRef } from "react";
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
    limit: number,
  ) => Promise<FetchResult<T>>;
}

export function useSimpleListSearch<T>({
  rootPath,
  basePath,
  fetchFn,
  limit = 25,
}: SimpleListOptions<T>) {

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [items, setItems] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchLock = useRef(false);

  const loadData = async (
    reset: boolean,
    keyword: string,
    passedCursor: string | null
  ) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    setLoading(true);

    try {
      const result = await fetchFn(
        rootPath,
        basePath,
        keyword.trim() || null,
        reset ? null : passedCursor,
        limit
      );

      const ok = handleBackendError(result as any, () => {}, showSnackbar);
      if (!ok) {
        if (reset) setItems([]);
        fetchLock.current = false;
        return;
      }

      const data = result.data ?? [];

      setItems((prev) => (reset ? data : [...prev, ...data]));
      setCursor(result.nextCursor ?? null);
      setHasMore(result.nextCursor !== null);

    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat data",
        "error"
      );

    } finally {
      setLoading(false);
      fetchLock.current = false;
    }
  };

  // ⏳ First load
  useEffect(() => {
    loadData(true, search, null);
  }, []);

  // 🔍 Search debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      setHasMore(true);
      loadData(true, search, null);
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // ⏬ Load more (pagination)
  const loadMore = async () => {
    if (!hasMore || loading) return;
    await loadData(false, search, cursor);
  };

  const clearSearch = () => setSearch("");

  return {
    items,
    search,
    setSearch,
    clearSearch,
    loading,
    loadMore,
    hasMore,
    reload: () => loadData(true, search, null),
  };
}
