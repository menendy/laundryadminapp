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
import { setOutlet } from "../../services/api/outletsService";


export const unstable_settings = {
    presentation: "modal",
};

export default function EditOutletScreen() {
    const router = useRouter();
    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

    const { rootBase: rootPath, basePath } = useBasePath();

    const list = useUniversalPaginatedList({
        rootPath,
        basePath,
        fetchFn: getOutletsByUser,
        defaultMode: "name",
    });

    // 🔑 outlet_id sebagai single source of truth
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        list.onRefresh();
    }, []);

    const handleConfirm = async () => {
        if (!selected) return;

        const outlet = list.items.find(
            (item: any) => item.outlet_id === selected
        );

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


            // 🔥 KIRIM BALIK KE PARENT (profil/index.tsx)
            router.setParams({
                updatedField: "outlet_default",
                updatedValue: JSON.stringify({
                    id: outlet.outlet_id,
                    name: outlet.outlet_name,
                }),
            });

            // ❗ TIDAK perlu refresh token manual di sini
            // token listener / interceptor akan handle

            showSnackbar("Outlet berhasil dipilih!", "success");
            router.back();
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
                    {/* LEFT CONTENT */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>
                            {item.outlet_name}
                        </Text>

                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                            <MaterialCommunityIcons
                                name="storefront-outline"
                                size={16}
                                color="#999"
                            />
                            <Text style={{ fontSize: 12, marginLeft: 6, color: "#555" }}>
                                {item.outlet_address || "Alamat belum diisi"}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                            <MaterialCommunityIcons
                                name="account-check"
                                size={16}
                                color="#999"
                            />
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

                    {/* 🔘 RADIO CIRCLE */}
                    <View
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            borderWidth: 2,
                            borderColor: isSelected ? "#2883c5ff" : "#CCC",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: 12,
                        }}
                    >
                        {isSelected && (
                            <View
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 6,
                                    backgroundColor: "#2883c5ff",
                                }}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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

            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "700",
                    textAlign: "center",
                    marginTop: 12,
                    marginBottom: 16,
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

            {list.loading && list.items.length === 0 ? (
                <ActivityIndicator size="large" style={{ marginTop: 35 }} />
            ) : (
                <FlatList
                    data={list.items}
                    keyExtractor={(item) => item.outlet_id} // 🔑 FIX UTAMA
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 200 }}
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
                            <Text
                                style={{
                                    textAlign: "center",
                                    marginTop: 20,
                                    color: "#777",
                                }}
                            >
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

            {/* Confirm Button */}
            <Button
                mode="contained"
                onPress={handleConfirm}
                disabled={!selected}
                style={{
                    marginTop: 20,
                    marginBottom: 140,
                    borderRadius: 50,
                }}
                contentStyle={{ paddingVertical: 10 }}
            >
                Konfirmasi
            </Button>
        </Animated.View>
    );
}
