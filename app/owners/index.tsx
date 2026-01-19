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
// 👇 1. UPDATE IMPORT: Tambahkan useFocusEffect dan useLocalSearchParams
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";

import { getOwnerList } from "../../services/api/ownersService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/useUniversalPaginatedList";
import { useBasePath } from "../../utils/useBasePath";

// ============================================================
// ITEM COMPONENT (Standardized UI)
// ============================================================
const OwnerItem = memo(({ item, onEdit }: { item: any; onEdit: (i: any) => void }) => {
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
            {/* Email Row */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={16} color="#999" />
              <Text style={styles.descText}>{item.email}</Text>
            </View>

            {/* Phone Row */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={16} color="#999" />
              <Text style={styles.descText}>{item.phone}</Text>
            </View>

            {/* Status Row */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name={item.active ? "check-circle" : "close-circle"}
                size={16}
                color={item.active ? "#2e7d32" : "#d32f2f"}
              />
              <Text style={[styles.statusText, { color: item.active ? "#2e7d32" : "#d32f2f" }]}>
                {item.active ? "Aktif" : "Nonaktif"}
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
export default function OwnerListScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();

  // 👇 2. TANGKAP PARAMETER REFRESH
  const params = useLocalSearchParams<{ refreshTimestamp?: string }>();

  // Integrasi TanStack Query via Hook
  const list = useUniversalPaginatedList<any, "nama" | "telp" | "email">({
    rootPath,
    basePath,
    fetchFn: getOwnerList,
    defaultMode: "nama",
  });

  // 👇 3. LOGIC AUTO REFRESH
  // Dijalankan setiap kali layar ini menjadi fokus (aktif)
  useFocusEffect(
    useCallback(() => {
      // Jika ada parameter refreshTimestamp (dikirim dari Delete/Edit)
      if (params.refreshTimestamp) {
        console.log("♻️ Data berubah, melakukan refresh otomatis...");
        
        // Panggil fungsi refresh bawaan hook list
        list.onRefresh();

        // Bersihkan parameter agar tidak refresh berulang-ulang
        router.setParams({ refreshTimestamp: undefined });
      }
    }, [params.refreshTimestamp, list.onRefresh])
  );

  // Render item di-memo agar scrolling tetap halus (60 FPS)
  const renderItem = useCallback(({ item }: any) => (
    <OwnerItem
      item={item}
      onEdit={(i: any) => router.push(`/owners/edit/${i.id}`)}
    />
  ), []);

  return (
    <View style={styles.screen}>
      <AppHeaderList
        title="Daftar Owner"
        onAdd={() => router.push("/owners/add")}
      />

      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        onChangeMode={(m) => list.setMode(m as "nama" | "telp" | "email")}
        categories={[
          { label: "Nama", value: "nama" },
          { label: "Telp", value: "telp" },
          { label: "Email", value: "email" },
        ]}
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
            <Text style={styles.emptyText}>Belum ada owner</Text>
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
// STYLES (Robust & Clean)
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
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  descText: { fontSize: 13, color: "#666", marginLeft: 6 },
  statusText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  idRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  idText: { fontSize: 11, color: "#999", marginRight: 6 },
  chevron: { justifyContent: "center", paddingRight: 4 },
  centerLoading: { paddingTop: 40 },
  listContent: { paddingBottom: 100 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  footerLoader: { marginVertical: 20 },
});