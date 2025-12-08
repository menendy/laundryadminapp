import React, { memo, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
  Pressable,
  Platform,
  ToastAndroid,
} from "react-native";
import { Card, List, ActivityIndicator } from "react-native-paper";
import Clipboard from "@react-native-clipboard/clipboard";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getOutletList } from "../../services/api/outletsService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/UniversalPaginatedList";
import { useBasePath } from "../../utils/useBasePath";

/* CARD ITEM */
const OutletItem = memo(
  ({ item, activeMenuId, onOpenMenu, onCloseMenu, onDetail, onEdit }: any) => {
    const copyId = () => {
      Clipboard.setString(item.id);
      if (Platform.OS === "android") {
        ToastAndroid.show("ID berhasil disalin!", ToastAndroid.SHORT);
      }
    };

    const isMenuVisible = activeMenuId === item.id;

    return (
      <Card
        onPress={onOpenMenu}
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
          description={
            <>
              <View style={{ marginTop: 4 }}>
              
                {/* Alamat */}
                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600" }}>
                    Alamat :
                  </Text>
                  <Text style={{ fontSize: 14, marginLeft: 3 }}>
                    {item.address}
                  </Text>
                </View>

                {/* Telepon */}
                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600" }}>
                    Telepon :
                  </Text>
                  <Text style={{ fontSize: 14, marginLeft: 3 }}>
                    {item.phone}
                  </Text>
                </View>

                {/* ID */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{ fontSize: 12, color: "#666", marginRight: 8 }}
                  >
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
            </>
          }
          descriptionNumberOfLines={6}
          right={() => (
            <Pressable onPress={onOpenMenu} style={{ paddingHorizontal: 3 }}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color="#555"
              />
            </Pressable>
          )}
        />

        {/* Popup Action Menu */}
        {isMenuVisible && (
          <>
            {/* Overlay */}
            <Pressable
              onPress={onCloseMenu}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "transparent",
              }}
            />

            {/* Popup Box */}
            <Animated.View
              entering={ZoomIn}
              exiting={ZoomOut}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "#fff",
                borderRadius: 14,
                paddingVertical: 10,
                width: 160,
                elevation: 12,
                shadowColor: "#000",
                shadowOpacity: 0.18,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Pressable
                onPress={onDetail}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  backgroundColor: pressed ? "#f1f5f9" : "transparent",
                })}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={22}
                  color="#1976d2"
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontSize: 15 }}>Detail</Text>
              </Pressable>

              <Pressable
                onPress={onEdit}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  backgroundColor: pressed ? "#f1f5f9" : "transparent",
                })}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={22}
                  color="#1976d2"
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontSize: 15 }}>Edit</Text>
              </Pressable>
            </Animated.View>
          </>
        )}
      </Card>
    );
  }
);

export default function OutletListScreen() {
  const router = useRouter();

  const { rootBase: rootPath, basePath } = useBasePath();

  const list = useUniversalPaginatedList({
    rootPath,
    basePath,
    fetchFn: getOutletList,
    defaultMode: "name",
  });

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const renderItem = ({ item }: any) => (
    <OutletItem
      item={item}
      activeMenuId={activeMenuId}
      onOpenMenu={() => setActiveMenuId(item.id)}
      onCloseMenu={() => setActiveMenuId(null)}
      onDetail={() => {
        setActiveMenuId(null);
        router.push(`/outlets/${item.id}`);
      }}
      onEdit={() => {
        setActiveMenuId(null);
        router.push(`/outlets/edit/${item.id}`);
      }}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>

      <AppHeaderList
        title="Daftar Outlet"
        onAdd={() => router.push("/outlets/add")}
      />

      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        onChangeMode={(m) => list.setMode(m)}
        placeholder="Cari nama outlet..."
        categories={[{ label: "Nama", value: "name" }]}
        defaultMode="name"
      />

      {list.loading && list.items.length === 0 && (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
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
              Belum ada data outlet
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
