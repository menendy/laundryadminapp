import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ActivityIndicator, List } from "react-native-paper";
import { useRouter, useGlobalSearchParams } from "expo-router";
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

    /* ================= LOAD ================= */

    const loadData = async () => {
        try {
            const res = await getGlobalUserById(String(id));

            setData({
                name: res.data.name,
                alias: res.data.alias ?? "",
                phone: res.data.phone?.replace(/^(\+62|62)/, "") ?? "",
                email: res.data.email ?? "",
            });

            setActive(res.data.active);
        } catch (err) {
            handleBackendError(err, setErrors, showSnackbar);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    /* ================= REALTIME UPDATE ================= */

    useEffect(() => {
        if (!params.updatedField) return;

        const f = params.updatedField;
        const v = params.updatedValue ?? "";

        if (f === "name") setData((p) => ({ ...p, name: v }));
        if (f === "alias") setData((p) => ({ ...p, alias: v }));
        if (f === "phone") setData((p) => ({ ...p, phone: v }));
        if (f === "email") setData((p) => ({ ...p, email: v }));
        if (f === "active") setActive(v === "true" || v === "1");

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
        }
    };

      const handleDelete = async () => {
        try {
          setSaving(true);
          const res = await deleteGlobalUser(String(id), { rootPath, basePath });
          const ok = handleBackendError(res, setErrors, showSnackbar);
          if (!ok) return false;
          showSnackbar("Berhasil dihapus", "success");
          return true;
        } finally {
          setSaving(false);
        }
      };

    /* ================= UI ================= */

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size="large" />
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
                    message={
                        pendingActiveValue
                            ? "Apakah Anda yakin ingin mengaktifkan akun global user ini?"
                            : "Apakah Anda yakin ingin menonaktifkan akun global user ini?"
                    }
                    confirmText="Ya, Lanjutkan"
                    cancelText="Batal"
                    onConfirm={async () => {
                        setConfirmVisible(false);
                        setActive(pendingActiveValue);
                        await handleUpdateStatus(pendingActiveValue);
                    }}
                    onCancel={() => {
                        setConfirmVisible(false);
                        setActive(active);
                    }}
                />

                <ConfirmBottomSheet
                    visible={confirmDeleteVisible}
                    title="Hapus Pengguna?"
                    message="Apakah Anda yakin ingin menghapus pengguna ini?"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                    onConfirm={async () => {
                        setConfirmDeleteVisible(false);

                        const prev = active; // simpan state lama untuk rollback jika perlu
                        try {
                            setSaving(true);

                            // panggil API delete
                            const ok = await handleDelete();
                            if (!ok) {
                                setActive(prev); // rollback UI kalau gagal
                                return;
                            }

                            showSnackbar("Berhasil dihapus", "success");

                            // kembali ke halaman daftar
                            router.replace("/global_user");
                        } catch (err) {
                            handleBackendError(err, setErrors, showSnackbar);
                            setActive(prev);
                        } finally {
                            setSaving(false);
                        }
                    }}

                    onCancel={() => {
                        setConfirmDeleteVisible(false);
                    }}
                />

                {/* === STATUS === */}
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

                {/* === DATA === */}
                <SectionListCard
                    title="Data Global User"
                    items={[
                        ["name", "Nama Lengkap"],
                        ["alias", "Nama Panggilan"],
                        ["phone", "No. Handphone"],
                        ["email", "Email"],
                    ].map(([field, label]) => ({
                        label,
                        value:
                            field === "phone"
                                ? data.phone
                                    ? `+62${data.phone}`
                                    : "Atur Sekarang"
                                : (data as any)[field] || "Atur Sekarang",
                        right: () => <List.Icon icon="chevron-right" />,
                        onPress: () => goEdit(field, label, (data as any)[field]),
                    }))}
                />

                {/* === DELETE === */}
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F4F4" },
    scroll: { flex: 1 },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
});
