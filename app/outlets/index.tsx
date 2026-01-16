import React, { memo, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
  Pressable,
  Platform,
  ToastAndroid,
  StyleSheet,
} from "react-native";
import { Card, List, ActivityIndicator } from "react-native-paper";
import Clipboard from "@react-native-clipboard/clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getOutletList } from "../../services/api/outletsService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/useUniversalPaginatedList"; // Gunakan versi TanStack
import { useBasePath } from "../../utils/useBasePath";

// ================================
// ITEM COMPONENT (Optimized)
// ================================
const OutletItem = memo(({ item, onEdit }: { item: any; onEdit: (i: any) => void }) => {
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
            <View style={styles.infoRow}>
              <Text style={styles.label}>Alamat :</Text>
              <Text style={styles.value}>{item.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Telepon :</Text>
              <Text style={styles.value}>{item.phone}</Text>
            </View>

            <Pressable onPress={copyId} style={styles.idRow}>
              <Text style={styles.idText}>{item.id}</Text>
              <MaterialCommunityIcons name="content-copy" size={16} color="#999" />
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

// ================================
// MAIN SCREEN
// ================================
export default function OutletListScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();

  // Integrasi TanStack Query via Hook
  const list = useUniversalPaginatedList<any, "name">({
    rootPath,
    basePath,
    fetchFn: getOutletList,
    defaultMode: "name",
  });

  // Render item di-memo agar scrolling tetap halus (60 FPS)
  const renderItem = useCallback(({ item }: any) => (
    <OutletItem
      item={item}
      onEdit={(i) => router.push(`/outlets/edit/${i.id}`)}
    />
  ), []);

  return (
    <View style={styles.screen}>
      <AppHeaderList
        title="Daftar Outlet"
        onAdd={() => router.push("/outlets/add")}
      />

      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        // Casting 'm' menjadi tipe yang diharapkan oleh setMode
        onChangeMode={(m) => list.setMode(m as "name")}
        placeholder="Cari nama outlet..."
        categories={[{ label: "Nama", value: "name" }]}
      />

      {/* State Loading Awal */}
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
            <Text style={styles.emptyText}>Belum ada data outlet</Text>
          ) : null
        }
        ListFooterComponent={
          list.loading && list.items.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      />
    </View>
  );
}

// ================================
// STYLES (Clean & Robust)
// ================================
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
  infoRow: { flexDirection: "row", marginBottom: 3, flexWrap: "wrap" },
  label: { fontSize: 13, fontWeight: "600", color: "#555" },
  value: { fontSize: 13, color: "#666", marginLeft: 4, flexShrink: 1 },
  idRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  idText: { fontSize: 11, color: "#999", marginRight: 6 },
  chevron: { justifyContent: "center", paddingRight: 4 },
  centerLoading: { paddingTop: 40 },
  listContent: { paddingBottom: 100 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  footerLoader: { marginVertical: 20 },
});