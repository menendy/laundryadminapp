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

import { getPagesOperationalList } from "../../services/api/pagesOperationalService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";

const PageOperationalItem = memo(
  ({ item, onDetail }: { item: any; onDetail: () => void }) => (
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
        description={`Screen: ${item.component}\nRoles: ${item.allowed_roles?.join(
          ", "
        )}`}
        right={() => (
          <Button textColor="#1976d2" onPress={onDetail}>
            Detail
          </Button>
        )}
      />
    </Card>
  )
);

export default function PagesOperationalListScreen() {
  const router = useRouter();

  const [pages, setPages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* 🔥 KEY LOCK VARIABLES */
  const didInitialLoad = useRef(false);
  const fetchLock = useRef(false);
  const endReachedLock = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /* ========================================================
     PROTECTED FETCH
  ======================================================== */
  const safeFetch = useCallback(
    async (reset = false) => {
      if (fetchLock.current) return; // prevent parallel fetch

      fetchLock.current = true;
      setLoading(true);

      try {
        const result = await getPagesOperationalList(
          search.trim() || null,
          reset ? null : cursor,
          10
        );

        if (result.success) {
          setPages((prev) => {
            const merged = reset
              ? result.data
              : [...prev, ...result.data];

            // remove duplicates
            const unique = Array.from(
              new Map(merged.map((i) => [i.id, i])).values()
            );

            return unique;
          });

          setCursor(result.nextCursor ?? null);
          setHasMore(!!result.nextCursor);
        }
      } catch (err) {
        console.error("🔥 Error fetch pages:", err);
      } finally {
        fetchLock.current = false;
        setLoading(false);
      }
    },
    [search, cursor]
  );

  /* ========================================================
     INITIAL LOAD — run once only
  ======================================================== */
  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;

    safeFetch(true).then(() => {
      // unlock onEndReached AFTER first fetch
      setTimeout(() => {
        endReachedLock.current = false;
      }, 300);
    });

    // lock onEndReached until initial fetch done
    endReachedLock.current = true;
  }, []);

  /* ========================================================
     SEARCH DEBOUNCE — ignore initial render
  ======================================================== */
  useEffect(() => {
    if (!didInitialLoad.current) return;

    if (debounceTimer.current)
      clearTimeout(debounceTimer.current);

    // prevent debounce when search empty
    if (search.trim() === "") {
      setCursor(null);
      safeFetch(true);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setCursor(null);
      safeFetch(true);
    }, 500);
  }, [search]);

  /* ========================================================
     REFRESH — strict single fetch
  ======================================================== */
  const onRefresh = async () => {
    setRefreshing(true);

    endReachedLock.current = true; // block auto-trigger
    setCursor(null);

    await safeFetch(true);

    // unlock after refresh settle
    setTimeout(() => {
      endReachedLock.current = false;
      setRefreshing(false);
    }, 300);
  };

  /* ========================================================
     RENDER ITEM
  ======================================================== */
  const renderItem = useCallback(
    ({ item }: any) => (
      <PageOperationalItem
        item={item}
        onDetail={() =>
          router.push(`/pages_operational/${item.id}`)
        }
      />
    ),
    []
  );

  /* ========================================================
     UI
  ======================================================== */
  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList
        title="Halaman Operasional"
        onAdd={() => router.push("/pages_operational/add")}
      />

      <AppSearchBarBottomSheet
        value={search}
        onChangeText={setSearch}
        mode="nama"
        onChangeMode={() => {}}
        placeholder="Cari nama halaman..."
        categories={[{ label: "Nama Halaman", value: "nama" }]}
        defaultMode="nama"
      />

      <FlatList
        data={pages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (endReachedLock.current) return;
          if (!loading && hasMore) safeFetch();
        }}
        ListEmptyComponent={
          !loading && (
            <Text
              style={{
                textAlign: "center",
                color: "#777",
                marginTop: 20,
              }}
            >
              Belum ada data
            </Text>
          )
        }
        ListFooterComponent={
          loading && pages.length > 0 ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    </View>
  );
}
