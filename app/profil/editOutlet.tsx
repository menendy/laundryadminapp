import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { Text, ActivityIndicator, Button } from "react-native-paper";
import Animated, { SlideInUp, SlideOutDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUniversalPaginatedList } from "../../hooks/UniversalPaginatedList";
import { useBasePath } from "../../utils/useBasePath";
import { getOutletsByUser } from "../../services/api/outletsService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import AppSearchBarBottomSheet from "../../components/ui/AppSearchBarBottomSheet";


export const unstable_settings = {
    presentation: "modal",
};

export default function EditOutletScreen() {
    const router = useRouter();
    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

    const { rootBase: rootPath, basePath } = useBasePath();

    

    const list = useUniversalPaginatedList({
        rootPath,
        basePath, // bisa disesuaikan bila butuh
        fetchFn: getOutletsByUser,
        defaultMode: "name",
    });

    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        list.onRefresh();
    }, []);



    const handleConfirm = () => {
        if (!selected) return;

        showSnackbar("Outlet berhasil dipilih!", "success");
        router.back();

        // TODO: update backend outlet_id_default
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => setSelected(item.id)}
            style={{
                paddingVertical: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: selected === item.id ? "#2883c5ff" : "#EEE",
                backgroundColor: selected === item.id ? "#f0f6ffff" : "#FFF",
                marginBottom: 12,
                paddingHorizontal: 12,
            }}
        >
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                {item.outlet_name}
            </Text>


            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="storefront-outline" size={16} color="#999" />
                <Text style={{ fontSize: 12, marginLeft: 5, color: "#555" }}>
                    {item.outlet_address || "Alamat belum diisi"}
                </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="account-check" size={16} color="#999" />
                <Text style={{ fontSize: 12, marginLeft: 5, color: "#555" }}>
                    {item.user_name || "Owner belum diisi"}
                </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="email" size={16} color="#999" />
                <Text style={{ fontSize: 12, marginLeft: 5, color: "#555" }}>
                    {item.user_email || "email belum diisi"}
                </Text>
            </View>

        </TouchableOpacity>
    );

    return (
        <Animated.View
            entering={SlideInUp}
            exiting={SlideOutDown}
            style={{
                flex: 1,
                backgroundColor: "#fff",
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
            }}
        >
            {/* Header */}
            <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ fontSize: 16, color: "#696969ff" }}>Batal</Text>
                </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 18, fontWeight: "700", textAlign: "center", marginTop: 12, marginBottom: 16 }}>
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



            {list.loading && list.items.length === 0 ? (
                <ActivityIndicator size="large" style={{ marginTop: 35 }} />
            ) : (
                <FlatList
                    data={list.items}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    contentContainerStyle={{
                        paddingBottom: 200, // 🔥 agar list tidak tertutup tombol
                    }}
                    refreshControl={
                        <RefreshControl refreshing={list.refreshing} onRefresh={list.onRefresh} />
                    }
                    onEndReachedThreshold={0.4}
                    onEndReached={list.onEndReached}
                    ListEmptyComponent={
                        !list.loading ? (
                            <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
                                Tidak ada outlet.
                            </Text>
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

            {/* Confirm Button  */}
            <Button
                mode="contained"
                onPress={handleConfirm}
                disabled={!selected}
                style={{
                    marginTop: 20,
                    marginBottom: 140, // 🔥 supaya di atas BottomNav
                    borderRadius: 50, // agar bentuknya oval seperti "Simpan"
                }}
                contentStyle={{
                    paddingVertical: 10, // biar lebih tinggi dan rapi
                }}
            >
                Konfirmasi
            </Button>


        </Animated.View>
    );

}
