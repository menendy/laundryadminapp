import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import { Text, ActivityIndicator, Button } from "react-native-paper";
import Modal from "react-native-modal";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUniversalPaginatedList } from "../../hooks/UniversalPaginatedList";
import { useBasePath } from "../../utils/useBasePath";
import { getOutletsByUser, setOutlet } from "../../services/api/outletsService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";

export default function EditOutletScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const insets = useSafeAreaInsets();
  const { rootBase: rootPath, basePath } = useBasePath();

  const [isVisible, setIsVisible] = useState(false);

  // 🔥 1. Gunakan Ref untuk menyimpan data yang akan dikirim
  // Kita pakai Ref agar tidak memicu render ulang saat di-set
  const pendingUpdate = useRef<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const close = () => {
    setIsVisible(false);
    // Navigasi back akan dieksekusi di onModalHide
  };

  // 🔥 2. Logic Eksekusi Setelah Modal Hilang (Anti-Blink)
  const onModalHide = () => {
    // Jika ada data pending (artinya user klik Konfirmasi)
    if (pendingUpdate.current) {
      // Eksekusi setParams saat modal sudah invisible
      // User tidak akan melihat "blink" karena layar modal sudah clear
      router.setParams({
        updatedField: "outlet_default",
        updatedValue: JSON.stringify({
          id: pendingUpdate.current.id,
          name: pendingUpdate.current.name,
        }),
      });
      
      showSnackbar("Outlet berhasil dipilih!", "success");
    }

    // Selalu back di akhir
    router.back();
  };

  const list = useUniversalPaginatedList({
    rootPath,
    basePath,
    fetchFn: getOutletsByUser,
    defaultMode: "name",
  });

  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    list.onRefresh();
  }, []);

  const handleConfirm = async () => {
    if (!selected) return;

    const outlet = list.items.find((item: any) => item.outlet_id === selected);
    if (!outlet) {
      showSnackbar("Outlet tidak ditemukan", "error");
      return;
    }

    try {
      await setOutlet({
        rootPath,
        basePath,
        outlet_id: outlet.outlet_id,
        owner_id: outlet.owner_id,
        role_id: outlet.role_id,
      });

      // 🔥 3. JANGAN panggil setParams di sini.
      // Simpan data ke Ref, lalu tutup modal.
      pendingUpdate.current = { 
        id: outlet.outlet_id, 
        name: outlet.outlet_name 
      };

      // Tutup modal secara visual (animasi slide down)
      // Logic setParams akan jalan otomatis di onModalHide
      close(); 

    } catch (err: any) {
      console.error("setOutlet error:", err);
      showSnackbar(
        err?.response?.data?.message || "Gagal menyimpan outlet",
        "error"
      );
    }
  };

  const renderItem = ({ item }: any) => {
    const isSelected = selected === item.outlet_id;
    return (
      <TouchableOpacity
        onPress={() => setSelected(item.outlet_id)}
        activeOpacity={0.85}
        style={{
          paddingVertical: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isSelected ? "#2883c5ff" : "#E5E7EB",
          backgroundColor: isSelected ? "#f0f6ffff" : "#FFF",
          marginBottom: 12,
          paddingHorizontal: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>
              {item.outlet_name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <MaterialCommunityIcons name="storefront-outline" size={16} color="#999" />
              <Text style={{ fontSize: 12, marginLeft: 6, color: "#555" }}>
                {item.outlet_address || "Alamat belum diisi"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
               <MaterialCommunityIcons name="account-check" size={16} color="#999" />
               <Text style={{ fontSize: 12, marginLeft: 6, color: "#555" }}>
                 {item.owner_name || "Owner belum diisi"}
               </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
               <MaterialCommunityIcons name="email" size={16} color="#999" />
               <Text style={{ fontSize: 12, marginLeft: 6, color: "#555" }}>
                 {item.owner_email || "Email belum diisi"}
               </Text>
            </View>
          </View>

          <View
            style={{
              width: 22, height: 22, borderRadius: 11, borderWidth: 2,
              borderColor: isSelected ? "#2883c5ff" : "#CCC",
              alignItems: "center", justifyContent: "center", marginLeft: 12,
            }}
          >
            {isSelected && (
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#2883c5ff" }} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const deviceHeight = Dimensions.get("window").height;
  const modalHeight = deviceHeight * 0.92;

  return (
    <Modal
      isVisible={isVisible}
      // 🔥 4. Pasang Listener onModalHide
      onModalHide={onModalHide}
      
      onBackdropPress={close}
      onSwipeComplete={close}
      swipeDirection="down"
      
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      backdropTransitionOutTiming={0}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      
      style={{ margin: 0, justifyContent: "flex-end" }}
      propagateSwipe={true}
      statusBarTranslucent={true}
      coverScreen={true}
    >
      <View
        style={{
          height: modalHeight,
          backgroundColor: "#fff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 16,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
          <TouchableOpacity
            onPress={close}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={{ fontSize: 16, color: "#696969ff", fontWeight: "600" }}>
              Batal
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 18, fontWeight: "700", textAlign: "center",
            marginTop: 0, marginBottom: 16,
          }}
        >
          Pilih Outlet
        </Text>

        <AppSearchBarBottomSheet
          value={list.search}
          onChangeText={list.setSearch}
          mode={list.mode}
          onChangeMode={(m) => list.setMode(m)}
          placeholder="Cari nama outlet..."
          categories={[
            { label: "Nama Outlet", value: "name" },
            { label: "Email", value: "email" },
          ]}
          defaultMode="name"
        />

        <View style={{ flex: 1 }}>
          {list.loading && list.items.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={list.items}
              keyExtractor={(item) => item.outlet_id}
              renderItem={renderItem}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              refreshControl={
                <RefreshControl refreshing={list.refreshing} onRefresh={list.onRefresh} />
              }
              onEndReachedThreshold={0.4}
              onEndReached={list.onEndReached}
              ListEmptyComponent={
                !list.loading ? (
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
                    <Text style={{ color: "#777" }}>Tidak ada outlet.</Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                list.loading && list.items.length > 0 ? (
                  <ActivityIndicator style={{ marginVertical: 20 }} />
                ) : null
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <View>
          <Button
            mode="contained"
            onPress={handleConfirm}
            disabled={!selected}
            style={{
              marginTop: 10,
              marginBottom: insets.bottom + 20, 
              borderRadius: 50,
            }}
            contentStyle={{ paddingVertical: 10 }}
          >
            Konfirmasi
          </Button>
        </View>
      </View>
    </Modal>
  );
}