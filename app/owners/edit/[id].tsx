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
  getOwnerById,
  updateOwner,
  deleteOwner
} from "../../../services/api/ownersService";

import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { useBasePath } from "../../../utils/useBasePath";
import { handleBackendError } from "../../../utils/handleBackendError";

/* ================= TYPES ================= */

interface OwnerFormData {
  name: string;
  phone: string;
  email: string;
}

type EditParams = {
  id?: string;
  updatedField?: string;
  updatedValue?: string;
};

/* ================= SCREEN ================= */

export default function EditOwnerScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams<EditParams>();
  const id = params.id;

  const insets = useSafeAreaInsets();
  const { rootBase: rootPath, basePath } = useBasePath();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [active, setActive] = useState(true);
  const [pendingActive, setPendingActive] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const [data, setData] = useState<OwnerFormData>({
    name: "",
    phone: "",
    email: "",
  });

  /* ================= LOAD DATA (WITH FOCUS GUARD & PARAMETER GUARD) ================= */

  useFocusEffect(
    useCallback(() => {
      // 🔥 GUARD 1: Jika ada parameter update dari modal, JANGAN fetch ulang.
      if (params.updatedField) return;

      let isMounted = true;

      const loadData = async () => {
        if (!id) return;

        // 🔥 GUARD 2: Hanya tampilkan spinner jika data masih kosong
        if (!data.name) {
          setLoading(true);
        }

        try {
          const res = await getOwnerById(String(id), rootPath, basePath);
          
          if (isMounted) {
            setData({
              name: res.name,
              phone: res.phone?.replace(/^(\+62|62)/, "") ?? "",
              email: res.email,
            });
            setActive(res.active);
            setPendingActive(res.active);
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
    }, [id, rootPath, basePath, params.updatedField])
  );

  /* ================= REALTIME UPDATE SYNC ================= */

  useEffect(() => {
    if (!params.updatedField) return;

    const f = params.updatedField;
    const v = params.updatedValue ?? "";

    if (f === "name") setData((p) => ({ ...p, name: v }));
    if (f === "phone") setData((p) => ({ ...p, phone: v.replace(/^(\+62|62)/, "") }));
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
      pathname: "/owners/edit/modal/[field]",
      params: { id, field, label, value, rootPath, basePath },
    });

  const handleUpdateStatus = async (value: boolean) => {
    try {
      setSaving(true);
      const res = await updateOwner(String(id), {
        active: value,
        rootPath,
        basePath,
      });

      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return false;

      showSnackbar("Status akun diperbarui", "success");
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
      const res = await deleteOwner(String(id), { rootPath, basePath });
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return false;

      showSnackbar("Berhasil dihapus", "success");
      
      // 👇 PERUBAHAN PENTING DISINI: Kirim sinyal refreshTimestamp
      router.replace({
        pathname: "/owners",
        params: { refreshTimestamp: Date.now().toString() }
      }); 
      
      return true;
    } catch (err) {
      handleBackendError(err, setErrors, showSnackbar);
      return false;
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
      <AppHeaderActions showBack title="Data Owner" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ConfirmBottomSheet
          visible={confirmVisible}
          title={pendingActive ? "Aktifkan Akun Owner?" : "Nonaktifkan Akun Owner?"}
          message={
            pendingActive
              ? "Akun owner akan diaktifkan dan dapat mengakses sistem kembali."
              : "Akun owner akan dinonaktifkan dan tidak akan bisa melakukan login."
          }
          confirmText="Ya, Lanjutkan"
          onConfirm={async () => {
            setConfirmVisible(false);
            const ok = await handleUpdateStatus(pendingActive);
            if (ok) setActive(pendingActive);
          }}
          onCancel={() => setConfirmVisible(false)}
        />

        <ConfirmBottomSheet
          visible={confirmDeleteVisible}
          title="Hapus Pengguna?"
          message="Apakah Anda yakin ingin menghapus data owner ini secara permanen?"
          confirmText="Ya, Hapus"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteVisible(false)}
        />

        <SectionListCard
          style={{ marginTop: 16 }}
          title="Status Akun Owner"
          items={[
            {
              label: "Status",
              value: active ? "Aktif" : "Nonaktif",
              right: () => (
                <ToggleSwitch
                  value={active}
                  disabled={saving}
                  onChange={(val) => {
                    setPendingActive(val);
                    setConfirmVisible(true);
                  }}
                />
              ),
            },
          ]}
        />

        <SectionListCard
          title="Data Owner"
          items={[
            { label: "Nama Owner", field: "name", value: data.name },
            { label: "Nomor Telepon", field: "phone", value: data.phone ? `+62${data.phone}` : "" },
            { label: "Email", field: "email", value: data.email },
          ].map((item) => ({
            label: item.label,
            value: item.value || "Atur Sekarang",
            right: () => <List.Icon icon="chevron-right" />,
            onPress: () => goEdit(item.field, item.label, (data as any)[item.field]),
          }))}
        />

        <SectionListCard
          title=""
          items={[
            {
              label: "Hapus Owner",
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