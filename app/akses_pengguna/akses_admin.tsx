import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { Checkbox, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import AppHeaderActions from "../../components/ui/AppHeaderActions";
import { getPagesAdminListAll } from "../../services/api/aksesPenggunaService";
import { extractPermissionTypes } from "../../utils/permissionsHelper";
import { useRolePermissionStore } from "../../store/useRolePermissionStore";

export default function AksesHalamanAdminScreen() {
    const router = useRouter();
    const { permissions, setPermission } = useRolePermissionStore();

    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPages = async () => {
        setLoading(true);
        const data = await getPagesAdminListAll();
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => {
        loadPages();
    }, []);

    const togglePermission = (pageId: string, action: string) => {
        const prev = permissions[pageId] ?? [];
        const updated = prev.includes(action)
            ? prev.filter((p) => p !== action)
            : [...prev, action];

        setPermission(pageId, updated);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
            <AppHeaderActions title="Atur Halaman Admin" showBack />

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
                    {pages.map((pg: any) => {
                        const pagePerms = extractPermissionTypes(pg.permissions_type ?? {});
                        const selectedActions = permissions[pg.id] ?? [];

                        return (
                            <View
                                key={pg.id}
                                style={{
                                    backgroundColor: "#fff",
                                    padding: 14,
                                    borderRadius: 8,
                                    borderColor: "#ddd",
                                    borderWidth: 1,
                                }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "700", marginBottom: 12 }}>
                                    {pg.name}
                                </Text>

                                {pagePerms.length === 0 ? (
                                    <Text style={{ fontStyle: "italic", color: "#666" }}>
                                        Tidak ada permission
                                    </Text>
                                ) : (
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                                        {pagePerms.map((action: string) => (
                                            <View
                                                key={action}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <Text style={{ textTransform: "capitalize", fontSize: 14 }}>
                                                    {action}
                                                </Text>

                                                <Checkbox
                                                    status={selectedActions.includes(action) ? "checked" : "unchecked"}
                                                    onPress={() => togglePermission(pg.id, action)}
                                                />
                                            </View>
                                        ))}
                                    </View>

                                )}
                            </View>
                        );
                    })}

                    <Button
                        mode="contained"
                        onPress={() => {
                            console.log("Permissions state:", permissions);
                            router.back();
                        }}
                        style={{ marginTop: 30 }}
                    >
                        Simpan
                    </Button>

                    <Button
                        onPress={() => router.back()}
                        style={{ marginTop: 10 }}
                    >
                        Batal
                    </Button>
                </ScrollView>
            )}
        </View>
    );
}
