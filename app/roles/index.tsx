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

import { getRoleList } from "../../services/api/rolesService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";

/* ITEM */
const RoleItem = memo(({ item, onDetail }: any) => (
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
      title={`${item.name} (${item.type})`}
      description={`App: ${item.app_access?.join(", ")}`}
      right={() => (
        <Button textColor="#1976d2" onPress={onDetail}>
          Detail
        </Button>
      )}
    />
  </Card>
));

export default function RoleListScreen() {
  const router = useRouter();

  const [roles, setRoles] = useState<any[]>([]);
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
        const result = await getRoleList(search.trim() || null, reset ? null : cursor, 10);

        if (result.success) {
          setRoles((prev) => {
            const merged = reset ? result.data : [...prev, ...result.data];
            const unique = Array.from(new Map(merged.map((i) => [i.id, i])).values());
            return unique;
          });

          setCursor(result.nextCursor ?? null);
          setHasMore(!!result.nextCursor);
        }
      } catch (err) {
        console.error("🔥 Error fetch roles:", err);
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

  const renderItem = useCallback(({ item }: any) => <RoleItem item={item} onDetail={() => router.push(`/roles/${item.id}`)} />, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList title="Daftar Role" onAdd={() => router.push("/roles/add")} />

      <AppSearchBarBottomSheet
        value={search}
        onChangeText={setSearch}
        mode="nama"
        onChangeMode={() => {}}
        placeholder="Cari role..."
        categories={[{ label: "Nama", value: "nama" }]}
        defaultMode="nama"
      />

      <FlatList
        data={roles}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (endReachedLock.current) return;
          if (!loading && hasMore) safeFetch();
        }}
        ListEmptyComponent={
          !loading && <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>Belum ada role</Text>
        }
        ListFooterComponent={loading && roles.length > 0 ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    </View>
  );
}
