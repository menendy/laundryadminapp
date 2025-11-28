import React, { memo } from "react";
import { View, FlatList, RefreshControl, Keyboard,Text,
  TouchableOpacity, ToastAndroid, Platform, Pressable
 } from "react-native";
import { Card, List, ActivityIndicator } from "react-native-paper";
import Clipboard from "@react-native-clipboard/clipboard";

import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

import { MaterialCommunityIcons  } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";


import { getAksesAdminList } from "../../services/api/aksesPenggunaService";
import AppHeaderList from "../../components/ui/AppHeaderList";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";
import { useUniversalPaginatedList } from "../../hooks/UniversalPaginatedList";

/* CARD */
const AksesPenggunaItem = memo(({ item, activeMenuId, onOpenMenu, onCloseMenu, onView, onEdit }: any) => {

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
         

          {/* Description */}
          <View style={{ flexDirection: "row", marginBottom: 2 }}>
           
          <Text style={{ fontSize: 14, color: item.active ? "green" : "red", fontWeight: "600" }}>
          {item.description}
          </Text>
          </View>
       

          {/* Copy ID */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#666", marginRight: 8 }}>
             {item.id}
            </Text>
            <Pressable onPress={copyId}>
              <MaterialCommunityIcons name="content-copy" size={18} color="#666" style={{ marginTop :-3, marginLeft:-5 }} />
            </Pressable>
          </View>

        </View>

        </>
      }
      descriptionNumberOfLines={6}
      right={() => (
        <Pressable onPress={onOpenMenu} style={{ paddingHorizontal: 3 }}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#555" />
        </Pressable>
      )}
    />

    {/* Popup */}
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

        {/* Animated Popup Box */}
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
          {/* Lihat */}
          <Pressable
            onPress={() => onView(item)}
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
            <Text style={{ fontSize: 15 }}>Lihat</Text>
          </Pressable>

          {/* Edit */}
          <Pressable
            onPress={() => onEdit(item)}
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

});

  
export default function AksesPenggunaListScreen() {
  const router = useRouter();
  const pathname = usePathname();

  const list = useUniversalPaginatedList({
    modul: "akses_pengguna",
    pathname,
    fetchFn: getAksesAdminList,
    defaultMode: "semua",
  });

  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

    const renderItem = ({ item }: any) => (
      <AksesPenggunaItem
      item={item}
      activeMenuId={activeMenuId}
      onOpenMenu={() => setActiveMenuId(item.id)}
      onCloseMenu={() => setActiveMenuId(null)}
      onView={(i: any) => {
        setActiveMenuId(null);
        router.push(`/pages_admin/${i.id}`);
      }}
      onEdit={(i: any) => {
        setActiveMenuId(null);
        router.push(`/pages_admin/edit/${i.id}`);
      }}
    />
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderList title="Pengaturan Akses Pengguna" onAdd={() => router.push("/akses_pengguna/add")} />

      <AppSearchBarBottomSheet
        value={list.search}
        onChangeText={list.setSearch}
        mode={list.mode}
        onChangeMode={(m) => list.setMode(m)}
        placeholder="Cari nama..."
        categories={[
          { label: "Semua", value: "semua" },
          { label: "Nama", value: "name" },
          { label: "Description", value: "description" }
        ]}
        defaultMode="semua"
      />

      {list.loading && list.items.length === 0 && (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <FlatList
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 100 }} 
        scrollEnabled={true} 
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
