import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
} from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
} from "react-native";
import {
  Card,
  List,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { useRouter } from "expo-router";

import { getPagesAdminList } from "../../services/api/pagesAdminService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";

/* ITEM */
const PageAdminItem = memo(({ item, onDetail }: any) => (
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
      title={item.name}
      description={`Path: ${item.path}\nRoles: ${item.allowed_roles?.join(", ")}`}
      right={() => (
        <Button textColor="#1976d2" onPress={onDetail}>
          Detail
        </Button>
      )}
    />
  </Card>
));

export default function PagesAdminListScreen() {
  const router = useRouter();

  const [pages, setPages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const didInitialLoad = useRef(false);
  const fetchLock = useRef(false);
  const endReachedLock = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const safeFetch = useCallback(
    async (reset = false) => {
      if (fetchLock.current) return;
      fetchLock.current = true;
      setLoading(true);

      try {
        const result = await getPagesAdminList(search.trim() || null, reset ? null : cursor, 10);

        if (result.success) {
          setPages((prev) => {
            const merged = reset ? result.data : [...prev, ...result.data];
            const unique = Array.from(new Map(merged.map((i) => [i.id, i])).values());
            return unique;
          });

          setCursor(result.nextCursor ?? null);
          setHasMore(!!result.nextCursor);
        }
      } catch (err) {
        console.error("🔥 Error fetch pages_admin:", err);
      } finally {
        fetchLock.current = false;
        setLoading(false);
      }
    },
    [search, cursor]
  );

  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;

    safeFetch(true).then(() => {
      setTimeout(() => (endReachedLock.current = false), 300);
    });
  }, []);

  useEffect(() => {
    if (!didInitialLoad.current) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (search.trim() === "") {
      setCursor(null);
      safeFetch(true);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      safeFetch(true);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    endReachedLock.current = true;
    setCursor(null);

    await safeFetch(true);

    setTimeout(() => {
      endReachedLock.current = false;
      setRefreshing(false);
    }, 300);
  };

  const renderItem = useCallback(({ item }: any) => <PageAdminItem item={item} onDetail={() => router.push(`/pages_admin/${item.id}`)} />, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList title="Halaman Admin" onAdd={() => router.push("/pages_admin/add")} />

      <AppSearchBarBottomSheet
        value={search}
        onChangeText={setSearch}
        mode="nama"
        onChangeMode={() => {}}
        placeholder="Cari halaman admin..."
        categories={[{ label: "Nama", value: "nama" }]}
        defaultMode="nama"
      />

      <FlatList
        data={pages}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (endReachedLock.current) return;
          if (!loading && hasMore) safeFetch();
        }}
        ListEmptyComponent={
          !loading && <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>Belum ada halaman admin</Text>
        }
        ListFooterComponent={loading && pages.length > 0 ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    </View>
  );
}
