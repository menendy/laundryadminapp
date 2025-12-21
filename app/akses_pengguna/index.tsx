import React, { memo } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
  ToastAndroid,
  Platform,
  Pressable,
} from "react-native";
import { Card, List, ActivityIndicator } from "react-native-paper";
import Clipboard from "@react-native-clipboard/clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getAksesAdminList } from "../../services/api/aksesPenggunaService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/UniversalPaginatedList";
import { useBasePath } from "../../utils/useBasePath";

/* ============================================================
   ITEM COMPONENT (Updated, Clean Version)
============================================================ */
const AksesPenggunaItem = memo(({ item, onEdit }: any) => {
  const copyId = () => {
    Clipboard.setString(item.id);
    if (Platform.OS === "android") {
      ToastAndroid.show("ID berhasil disalin!", ToastAndroid.SHORT);
    }
  };

  return (
    <Card
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eee",
        marginHorizontal: 12,
        marginBottom: 14,
      }}
    >
      <List.Item
        title={item.name}
        titleStyle={{ marginBottom: 6, fontWeight: "bold", fontSize: 17 }}
        description={() => (
          <View style={{ marginTop: 4 }}>
            {/* Status Aktif */}
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: item.active ? "green" : "red",
                  fontWeight: "600",
                }}
              >
                {item.active ? "Aktif" : "Nonaktif"}
              </Text>
            </View>

            {/* Copy ID */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: "#666", marginRight: 8 }}>
                {item.id}
              </Text>
              <Pressable onPress={copyId}>
                <MaterialCommunityIcons
                  name="content-copy"
                  size={18}
                  color="#666"
                  style={{ marginTop: -3, marginLeft: -5 }}
                />
              </Pressable>
            </View>
          </View>
        )}
        descriptionNumberOfLines={6}
        right={() => (
          <Pressable
            onPress={() => onEdit(item)}
            style={{ paddingHorizontal: 3 }}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
               color="#a3a1a1ff"
            />
          </Pressable>
        )}
      />
    </Card>
  );
});

/* ============================================================
   MAIN SCREEN
============================================================ */
export default function AksesPenggunaListScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();

  const list = useUniversalPaginatedList({
    rootPath,
    basePath,
    fetchFn: getAksesAdminList,
    defaultMode: "name",
  });

  const renderItem = ({ item }: any) => (
    <AksesPenggunaItem
      item={item}
      onEdit={(i: any) => router.push(`/akses_pengguna/edit/${i.id}`)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList
        title="Pengaturan Akses Pengguna"
        onAdd={() => router.push("/akses_pengguna/add")}
      />

      {/* Search Bar */}
      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        onChangeMode={(m) => list.setMode(m)}
        placeholder="Cari nama..."
        categories={[
          { label: "Nama", value: "name" },
        ]}
        defaultMode="name"
      />

      {/* Loading saat awal */}
      {list.loading && list.items.length === 0 && (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {/* LIST */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEnabled={true}
        data={list.items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={list.onRefresh}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={list.onEndReached}
        ListEmptyComponent={
          !list.loading ? (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
              Belum ada data
            </Text>
          ) : null
        }
        ListFooterComponent={
          list.loading && list.items.length > 0 ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    </View>
  );
}
