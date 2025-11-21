// C:\Users\WIN10\laundryadminapp\app\karyawan\index.tsx
import React, { useState, useEffect, useRef, memo } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
} from "react-native";
import { Card, List, Button, ActivityIndicator } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";

import { getMitraList } from "../../services/api/mitraService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useSnackbarStore } from "../../store/useSnackbarStore";

/* ITEM */
const MitraItem = memo(({ item, onDetail }: any) => (
  <Card
    style={{
      backgroundColor: "#fff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#eee",
      marginHorizontal: 12,
      marginBottom: 12,
    }}
  >
    <List.Item
      title={item.nama}
      description={`Alamat: ${item.alamat}\nTelp: ${item.telp}`}
      right={() => (
        <Button textColor="#1976d2" onPress={onDetail}>
          Detail
        </Button>
      )}
    />
  </Card>
));

export default function MitraListScreen() {
  const router = useRouter();
  //const pathname = usePathname() ?? "/karyawan";
  const pathname = usePathname();;
  const modul = "Karyawan"; // tetap hardcoded seperti permintaan

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [mitra, setMitra] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // guards & locks
  const didInitialLoad = useRef(false);
  const fetchLock = useRef(false);
  const endReachedLock = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // cleanup mounted flag on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // SAFE fetch function (not memoized). Accepts search & cursor as params
  async function safeFetch(reset = false, passedSearch = "", passedCursor: string | null = null) {
    // prevent parallel calls
    if (fetchLock.current) return;
    fetchLock.current = true;
    setLoading(true);

    try {
      // call backend with modul + path
      const result = await getMitraList(
        modul,
        pathname, // pass current pathname (string)
        passedSearch?.trim() || null,
        reset ? null : passedCursor,
        10,
        "semua"
      );

      // if component unmounted meanwhile, stop here
      if (!isMounted.current) return;

      if (!result || !result.success) {
        showSnackbar(result?.message || "Akses ditolak", "error");
        // clear data on access denied to avoid stale UI (optional)
        setMitra([]);
        setHasMore(false);
        setCursor(null);
        return;
      }

      // merge data (dedupe)
      setMitra((prev) => {
        const merged = reset ? result.data : [...prev, ...result.data];
        const unique = Array.from(new Map(merged.map((i: any) => [i.id, i])).values());
        return unique;
      });

      setCursor(result.nextCursor ?? null);
      setHasMore(!!result.nextCursor);
    } catch (err: any) {
      console.error("🔥 Error fetch mitra:", err);
      if (isMounted.current) showSnackbar("Terjadi kesalahan server", "error");
    } finally {
      fetchLock.current = false;
      if (isMounted.current) setLoading(false);
    }
  }

  // initial load — only once
  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;

    // initial fetch with current search + cursor
    // use immediate call (no debounce)
    safeFetch(true, search, null).then(() => {
      // allow onEndReached after a short delay
      setTimeout(() => {
        endReachedLock.current = false;
      }, 300);
    });
    // empty deps -> run once
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // search debounce effect
  useEffect(() => {
    if (!didInitialLoad.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (search.trim() === "") {
      // empty search -> reload list immediately
      setCursor(null);
      safeFetch(true, "", null);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      safeFetch(true, search, null);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [search]); // only re-run when search changes

  // pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    endReachedLock.current = true;
    setCursor(null);

    await safeFetch(true, search, null);

    setTimeout(() => {
      endReachedLock.current = false;
      setRefreshing(false);
    }, 300);
  };

  // onEndReached -> load next page
  const onEndReached = async () => {
    if (endReachedLock.current) return;
    if (loading || !hasMore) return;

    // avoid parallel calls
    await safeFetch(false, search, cursor);
  };

  const renderItem = React.useCallback(
    ({ item }: any) => (
      <MitraItem item={item} onDetail={() => router.push(`/karyawan/${item.id}`)} />
    ),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList title="Data Mitra" onAdd={() => router.push("/karyawan/add")} />

      <AppSearchBarBottomSheet
        value={search}
        onChangeText={setSearch}
        mode="semua"
        onChangeMode={() => {}}
        placeholder="Cari nama / telp..."
        categories={[
          { label: "Semua", value: "semua" },
          { label: "Nama", value: "nama" },
          { label: "Telepon", value: "telp" },
        ]}
        defaultMode="semua"
      />

      <FlatList
        data={mitra}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.4}
        onEndReached={onEndReached}
        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Belum ada data mitra.
            </Text>
          )
        }
        ListFooterComponent={loading && mitra.length > 0 ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    </View>
  );
}
