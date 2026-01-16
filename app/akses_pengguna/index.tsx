import React, { memo, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
  ToastAndroid,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { Card, List, ActivityIndicator } from "react-native-paper";
import Clipboard from "@react-native-clipboard/clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getAksesAdminList } from "../../services/api/aksesPenggunaService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/useUniversalPaginatedList"; // Versi TanStack
import { useBasePath } from "../../utils/useBasePath";

// ============================================================
// ITEM COMPONENT (Optimized & Standardized)
// ============================================================
const AksesPenggunaItem = memo(({ item, onEdit }: { item: any; onEdit: (i: any) => void }) => {
  const copyId = () => {
    if (!item?.id) return;
    Clipboard.setString(item.id);
    if (Platform.OS === "android") {
      ToastAndroid.show("ID berhasil disalin!", ToastAndroid.SHORT);
    }
  };

  return (
    <Card style={styles.card}>
      <List.Item
        title={item.name}
        titleStyle={styles.title}
        description={() => (
          <View style={styles.descContainer}>
            {/* Status Badge */}
            <View style={styles.statusRow}>
              <MaterialCommunityIcons
                name={item.active ? "shield-check" : "shield-off"}
                size={16}
                color={item.active ? "#2e7d32" : "#d32f2f"}
              />
              <Text style={[styles.statusText, { color: item.active ? "#2e7d32" : "#d32f2f" }]}>
                {item.active ? "Akses Aktif" : "Akses Nonaktif"}
              </Text>
            </View>

            {/* ID Section */}
            <Pressable onPress={copyId} style={styles.idRow}>
              <Text style={styles.idText}>{item.id}</Text>
              <MaterialCommunityIcons name="content-copy" size={14} color="#999" />
            </Pressable>
          </View>
        )}
        right={() => (
          <Pressable onPress={() => onEdit(item)} style={styles.chevron}>
            <MaterialCommunityIcons name="chevron-right" size={28} color="#ccc" />
          </Pressable>
        )}
      />
    </Card>
  );
});

// ============================================================
// MAIN SCREEN
// ============================================================
export default function AksesPenggunaListScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();

  // Integrasi TanStack Query via Hook
  const list = useUniversalPaginatedList<any, "name">({
    rootPath,
    basePath,
    fetchFn: getAksesAdminList,
    defaultMode: "name",
  });

  // Memoized render function untuk performa FlatList
  const renderItem = useCallback(({ item }: any) => (
    <AksesPenggunaItem
      item={item}
      onEdit={(i: any) => router.push(`/akses_pengguna/edit/${i.id}`)}
    />
  ), []);

  return (
    <View style={styles.screen}>
      <AppHeaderList
        title="Akses Pengguna"
        onAdd={() => router.push("/akses_pengguna/add")}
      />

      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        // Gunakan 'as any' atau casting ke tipe mode yang spesifik
        onChangeMode={(m) => list.setMode(m as "name")}
        placeholder="Cari nama akses..."
        categories={[{ label: "Nama", value: "name" }]}
      />

      {/* Initial Loading State */}
      {list.loading && list.items.length === 0 && (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={list.onRefresh}
          />
        }
        onEndReached={list.onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !list.loading ? (
            <Text style={styles.emptyText}>Belum ada data akses pengguna</Text>
          ) : null
        }
        ListFooterComponent={
          list.loading && list.items.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
      />
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9f9f9" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    elevation: 2,
    borderWidth: Platform.OS === "ios" ? 1 : 0,
    borderColor: "#eee",
  },
  title: { fontWeight: "bold", fontSize: 16, color: "#333" },
  descContainer: { marginTop: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  statusText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  idRow: { flexDirection: "row", alignItems: "center" },
  idText: { fontSize: 11, color: "#999", marginRight: 6 },
  chevron: { justifyContent: "center", paddingRight: 4 },
  centerLoading: { paddingTop: 40 },
  listContent: { paddingBottom: 100 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  footerLoader: { marginVertical: 20 },
});