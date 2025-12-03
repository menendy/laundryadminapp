// C:\Users\WIN10\laundryadminapp\app\karyawan\index.tsx
import React, { memo, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
  Pressable
} from "react-native";
import { Card, List, Button, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";

import { getMitraList } from "../../services/api/mitraService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/UniversalPaginatedList";
import { useBasePath } from "../../utils/useBasePath";

// Item Card
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
      titleStyle={{ fontWeight: "bold" }}
      description={`Alamat: ${item.alamat}\nTelp: ${item.telp}`}
      right={() => (
        <Button textColor="#1976d2" onPress={onDetail}>
          Detail
        </Button>
      )}
    />
  </Card>
));

export default function KaryawanListScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();

  const list = useUniversalPaginatedList({
    rootPath,
    basePath,
    fetchFn: getMitraList,
    defaultMode: "semua",
  });

  const renderItem = ({ item }: any) => (
    <MitraItem item={item} onDetail={() => router.push(`/karyawan/${item.id}`)} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList title="Data Mitra" onAdd={() => router.push("/karyawan/add")} />

      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        onChangeMode={(m) => list.setMode(m)}
        placeholder="Cari nama / telp..."
        categories={[
          { label: "Semua", value: "semua" },
          { label: "Nama", value: "nama" },
          { label: "Telepon", value: "telp" },
        ]}
        defaultMode="semua"
      />

      {list.loading && list.items.length === 0 && (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <FlatList
        data={list.items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={list.refreshing} onRefresh={list.onRefresh} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={list.onEndReached}
        ListEmptyComponent={
          !list.loading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Belum ada data Mitra.
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
