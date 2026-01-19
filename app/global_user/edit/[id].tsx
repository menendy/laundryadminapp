import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ActivityIndicator, List } from "react-native-paper";
import { useRouter, useGlobalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import SectionListCard from "../../../components/ui/SectionListCard";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";
import ConfirmBottomSheet from "../../../modals/ConfirmBottomSheet";

import {
    getGlobalUserById,
    updateGlobalUser, 
    deleteGlobalUser,
} from "../../../services/api/globaluserService";

import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { handleBackendError } from "../../../utils/handleBackendError";
import { useBasePath } from "../../../utils/useBasePath";

/* ================= TYPES ================= */

interface GlobalUserFormData {
    name: string;
    alias: string;
    phone: string;
    email: string;
}

type EditParams = {
    id?: string;
    updatedField?: string;
    updatedValue?: string;
};

/* ================= SCREEN ================= */

export default function EditGlobalUserScreen() {
    const router = useRouter();
    const params = useGlobalSearchParams<EditParams>();
    const id = params.id;

    const insets = useSafeAreaInsets();
    const { rootBase: rootPath, basePath } = useBasePath();
    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState<any>({});
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingActiveValue, setPendingActiveValue] = useState(active);

    const [data, setData] = useState<GlobalUserFormData>({
        name: "",
        alias: "",
        phone: "",
        email: "",
    });

    /* ================= LOAD (WITH FOCUS GUARD) ================= */

useFocusEffect(
        useCallback(() => {
            // Guard 1: Jika ada update dari modal (Simpan sukses), stop. 
            // Biarkan useEffect di bawah yang mengurus update state lokal.
            if (params.updatedField) return;

            // 🔥 GUARD 2 (BARU): Jika data sudah terload (nama tidak kosong), STOP.
            // Ini mencegah fetch ulang saat user hanya buka-tutup modal (Cancel).
            if (data.name) return;

            let isMounted = true;

            const loadData = async () => {
                if (!id) return;
                
                // Guard 3: Spinner hanya muncul jika data benar-benar kosong
                if (!data.name) {
                    setLoading(true);
                }
                
                try {
                    const res = await getGlobalUserById(String(id));
                    
                    if (isMounted) {
                        setData({
                            name: res.data.name,
                            alias: res.data.alias ?? "",
                            phone: res.data.phone?.replace(/^(\+62|62)/, "") ?? "",
                            email: res.data.email ?? "",
                        });
                        setActive(res.data.active);
                    }
                } catch (err) {
                    if (isMounted) {
                        handleBackendError(err, setErrors, showSnackbar);
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            };

            loadData();

            return () => {
                isMounted = false;
            };
            
            // 🔥 Tambahkan data.name ke dependency array
        }, [id, params.updatedField, data.name]) 
    );

    /* ================= REALTIME UPDATE SYNC ================= */

    useEffect(() => {
        if (!params.updatedField) return;

        const f = params.updatedField;
        const v = params.updatedValue ?? "";

        // Update state lokal
        if (f === "name") setData((p) => ({ ...p, name: v }));
        if (f === "alias") setData((p) => ({ ...p, alias: v }));
        if (f === "phone") setData((p) => ({ ...p, phone: v.replace(/^(\+62|62)/, "") }));
        if (f === "email") setData((p) => ({ ...p, email: v }));
        if (f === "active") setActive(v === "true" || v === "1");

        // ✅ PENTING: Bersihkan params setelah update state.
        // Ini memungkinkan useFocusEffect berjalan normal kembali jika nanti user keluar-masuk page ini.
        router.setParams({
            updatedField: undefined,
            updatedValue: undefined,
        });
    }, [params.updatedField, params.updatedValue]);

    /* ================= ACTIONS ================= */

    const goEdit = (field: string, label: string, value: string) =>
        router.push({
            pathname: "/global_user/edit/modal/[field]",
            params: { id, field, label, value, rootPath, basePath },
        });

    const handleUpdateStatus = async (value: boolean) => {
        try {
            setSaving(true);
            const res = await updateGlobalUser(String(id), {
                active: value,
                rootPath,
                basePath,
            });

            const ok = handleBackendError(res, setErrors, showSnackbar);
            if (!ok) return false;

            showSnackbar("Status diperbarui", "success");
            return true;
        } catch (err) {
            handleBackendError(err, setErrors, showSnackbar);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            const res = await deleteGlobalUser(String(id), { rootPath, basePath });
            const ok = handleBackendError(res, setErrors, showSnackbar);
            if (!ok) return false;

            showSnackbar("Berhasil dihapus", "success");
           router.replace({
    pathname: "/global_user",
    params: { refreshTimestamp: Date.now().toString() }
});
            return true;
        } finally {
            setSaving(false);
        }
    };

    /* ================= UI RENDERING ================= */

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#1976d2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeaderActions showBack title="Data Global User" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                showsVerticalScrollIndicator={false}
            >
                <ConfirmBottomSheet
                    visible={confirmVisible}
                    title={pendingActiveValue ? "Aktifkan Akun?" : "Nonaktifkan Akun?"}
                    message={`Apakah Anda yakin ingin ${pendingActiveValue ? 'mengaktifkan' : 'menonaktifkan'} akun global user ini?`}
                    onConfirm={async () => {
                        setConfirmVisible(false);
                        const prev = active;
                        setActive(pendingActiveValue);
                        const ok = await handleUpdateStatus(pendingActiveValue);
                        if (!ok) setActive(prev);
                    }}
                    onCancel={() => {
                        setConfirmVisible(false);
                        setActive(active);
                    }}
                />

                <ConfirmBottomSheet
                    visible={confirmDeleteVisible}
                    title="Hapus Pengguna?"
                    message="Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus pengguna ini?"
                    confirmText="Ya, Hapus"
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDeleteVisible(false)}
                />

                <SectionListCard
                    style={{ marginTop: 16 }}
                    title="Status Akun"
                    items={[
                        {
                            label: "Status",
                            value: active ? "Aktif" : "Nonaktif",
                            right: () => (
                                <ToggleSwitch
                                    value={active}
                                    disabled={saving}
                                    onChange={(val) => {
                                        setPendingActiveValue(val);
                                        setConfirmVisible(true);
                                    }}
                                />
                            ),
                        },
                    ]}
                />

                <SectionListCard
                    title="Data Global User"
                    items={[
                        { label: "Nama Lengkap", field: "name" },
                        { label: "Nama Panggilan", field: "alias" },
                        { label: "No. Handphone", field: "phone", prefix: "+62" },
                        { label: "Email", field: "email" },
                    ].map((item) => ({
                        label: item.label,
                        value: item.prefix 
                            ? (data.phone ? `${item.prefix}${data.phone}` : "Atur Sekarang")
                            : ((data as any)[item.field] || "Atur Sekarang"),
                        right: () => <List.Icon icon="chevron-right" />,
                        onPress: () => goEdit(item.field, item.label, (data as any)[item.field]),
                    }))}
                />

                <SectionListCard
                    title=""
                    items={[
                        {
                            label: "Hapus Pengguna Global User",
                            value: "",
                            right: () => <List.Icon icon="delete-outline" color="red" />,
                            onPress: () => setConfirmDeleteVisible(true),
                            labelStyle: { color: "red", fontWeight: "500", fontSize: 15 },
                        },
                    ]}
                />
            </ScrollView>

            {saving && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F4F4" },
    scroll: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingOverlay: {
        position: "absolute",
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
});