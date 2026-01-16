import React, { memo, useCallback } from "react";
import { View, FlatList, RefreshControl, Keyboard, Text, ToastAndroid, Platform, Pressable } from "react-native";
import { Card, List, ActivityIndicator } from "react-native-paper";
import Clipboard from "@react-native-clipboard/clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getMitraList } from "../../services/api/mitraService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/useUniversalPaginatedList";
import { useBasePath } from "../../utils/useBasePath";

// Item Component yang dioptimasi dengan React.memo
const MitraItem = memo(({ item, onEdit }: any) => {
  const copyId = () => {
    if (!item?.id) return;
    Clipboard.setString(item.id);
    if (Platform.OS === "android") ToastAndroid.show("ID berhasil disalin!", ToastAndroid.SHORT);
  };

  return (
    <Card style={styles.card}>
      <List.Item
        title={item.name}
        titleStyle={styles.cardTitle}
        description={() => (
          <View style={{ marginTop: 4 }}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="email" size={16} color="#999" />
              <Text style={styles.descText}>{item.email}</Text>
            </View>
            <View style={styles.row}>
              <MaterialCommunityIcons
                name={item.active ? "check-circle" : "close-circle"}
                size={16}
                color={item.active ? "green" : "red"}
              />
              <Text style={[styles.statusText, { color: item.active ? "green" : "red" }]}>
                {item.active ? "Aktif" : "Nonaktif"}
              </Text>
            </View>
            <Pressable onPress={copyId} style={styles.row}>
              <Text style={styles.idText}>{item.id}</Text>
              <MaterialCommunityIcons name="content-copy" size={14} color="#666" />
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

export default function KaryawanListScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();

  const list = useUniversalPaginatedList<any, "nama" | "telp" | "email">({
    rootPath,
    basePath,
    fetchFn: getMitraList,
    defaultMode: "nama",
  });

  const renderItem = useCallback(({ item }: any) => (
    <MitraItem item={item} onEdit={(i: any) => router.push(`/karyawan/edit/${i.id}`)} />
  ), []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList title="Daftar Mitra" onAdd={() => router.push("/karyawan/add")} />

      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        // FIX: Casting ke union type yang sesuai dengan hook
        onChangeMode={(m) => list.setMode(m as "nama" | "telp" | "email")}
        categories={[
          { label: "Nama", value: "nama" },
          { label: "Telp", value: "telp" },
          { label: "Email", value: "email" },
        ]}
      />

      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.onRefresh} />}
        onEndReached={list.onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!list.loading ? <Text style={styles.emptyText}>Belum ada data</Text> : null}
        ListFooterComponent={list.loading ? <ActivityIndicator style={{ margin: 20 }} /> : null}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      />
    </View>
  );
}

const styles = {
  card: { backgroundColor: "#fff", borderRadius: 12, marginHorizontal: 12, marginBottom: 12, elevation: 2 },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  descText: { fontSize: 13, color: "#666", marginLeft: 6 },
  statusText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  idText: { fontSize: 11, color: "#999", marginRight: 6 },
  chevron: { justifyContent: "center", paddingRight: 8 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" }
} as const;