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

  import { getOutletList } from "../../services/api/outletsService";

  import AppHeaderList from "../../components/ui/AppHeaderList";
  import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";

  /* ============================================================
    ITEM CARD COMPONENT
  ============================================================ */
  const OutletItem = memo(
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
          description={`Alamat: ${item.address}\nTelp: ${item.phone}`}
          right={() => (
            <Button textColor="#1976d2" onPress={onDetail}>
              Detail
            </Button>
          )}
        />
      </Card>
    )
  );

  /* ============================================================
    LIST SCREEN
  ============================================================ */
  export default function OutletListScreen() {
    const router = useRouter();

    const [outlets, setOutlets] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [cursor, setCursor] = useState<string | null>(null);

    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Prevent duplicate executes
    const didInitialLoad = useRef(false);
    const fetchLock = useRef(false);
    const endReachedLock = useRef(true);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    /* ============================================================
      SAFE FETCH — API DIPANGGIL DENGAN LOCK
    ============================================================ */
    const safeFetch = useCallback(
      async (reset = false) => {
        if (fetchLock.current) return; // prevent parallel calls

        fetchLock.current = true;
        setLoading(true);

        try {
          const result = await getOutletList(
            search.trim() || null,
            reset ? null : cursor,
            10
          );

          if (result.success) {
            setOutlets((prev) => {
              const merged = reset
                ? result.data
                : [...prev, ...result.data];

              // remove duplicates by id
              const unique = Array.from(
                new Map(merged.map((i) => [i.id, i])).values()
              );

              return unique;
            });

            setCursor(result.nextCursor ?? null);
            setHasMore(!!result.nextCursor);
          }
        } catch (err) {
          console.error("🔥 Error fetch outlets:", err);
        } finally {
          fetchLock.current = false;
          setLoading(false);
        }
      },
      [search, cursor]
    );

    /* ============================================================
      INITIAL LOAD — hanya 1x (strict-mode safe)
    ============================================================ */
    useEffect(() => {
      if (didInitialLoad.current) return;
      didInitialLoad.current = true;

      safeFetch(true).then(() => {
        setTimeout(() => {
          endReachedLock.current = false;
        }, 300);
      });
    }, []);

    /* ============================================================
      SEARCH DEBOUNCE — skip initial, skip empty search
    ============================================================ */
    useEffect(() => {
      if (!didInitialLoad.current) return;

      if (debounceTimer.current)
        clearTimeout(debounceTimer.current);

      // EMPTY SEARCH → reload list
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

    /* ============================================================
      REFRESH — safe, single API call
    ============================================================ */
    const onRefresh = async () => {
      setRefreshing(true);

      endReachedLock.current = true; // block auto load
      setCursor(null);

      await safeFetch(true);

      setTimeout(() => {
        endReachedLock.current = false;
        setRefreshing(false);
      }, 300);
    };

    /* ============================================================
      RENDER ITEM
    ============================================================ */
    const renderItem = useCallback(
      ({ item }: any) => (
        <OutletItem
          item={item}
          onDetail={() => router.push(`/outlets/${item.id}`)}
        />
      ),
      []
    );

    /* ============================================================
      MAIN UI
    ============================================================ */
    return (
      <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
        <AppHeaderList
          title="Daftar Outlet"
          onAdd={() => router.push("/outlets/add")}
        />

        {/* Search bar */}
        <AppSearchBarBottomSheet
          value={search}
          onChangeText={setSearch}
          mode="semua"
          onChangeMode={() => {}}
          placeholder="Cari outlet..."
          categories={[{ label: "Semua", value: "semua" }]}
          defaultMode="semua"
        />

        <FlatList
          data={outlets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                Belum ada data outlet
              </Text>
            )
          }
          ListFooterComponent={
            loading && outlets.length > 0 ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : null
          }
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        />
      </View>
    );
  }
