import React, { useState, useCallback, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { List, ActivityIndicator } from "react-native-paper";
import { useRouter, useGlobalSearchParams, useFocusEffect } from "expo-router"; // ✅ Tambahkan useFocusEffect
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import SectionListCard from "../../../components/ui/SectionListCard";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";

import { getAksesPenggunaById, deleteAksesPengguna, updateAksesPengguna } from "../../../services/api/aksesPenggunaService";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { useBasePath } from "../../../utils/useBasePath";
import ConfirmBottomSheet from "../../../modals/ConfirmBottomSheet";
import { handleBackendError } from "../../../utils/handleBackendError";

export default function EditAksesPenggunaScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams<any>();
  const { id } = params;

  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { rootBase: rootPath, basePath } = useBasePath();

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [active, setActive] = useState(true);
  const [appAccess, setAppAccess] = useState<string[]>([]);
  const [pendingActiveValue, setPendingActiveValue] = useState(active);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [errors, setErrors] = useState<any>({});

  /* ======================================================
     🔥 LOAD DATA (WITH FOCUS GUARD & PARAMETER GUARD)
     ====================================================== */
  useFocusEffect(
    useCallback(() => {
      // ✅ 1. PARAMETER GUARD:
      // Jika terdeteksi ada parameter update dari modal, JANGAN jalankan fetch ulang.
      // Ini mencegah loading spinner muncul dan mencegah data lokal tertimpa data lama server.
      if (params.updatedField) return;

      let isMounted = true;

      const loadData = async () => {
        if (!id) return;

        // ✅ 2. CONDITIONAL LOADING:
        // Hanya tampilkan spinner jika data benar-benar masih kosong (First Load).
        if (!name) {
          setInitialLoading(true);
        }

        try {
          const data = await getAksesPenggunaById(String(id), rootPath, basePath);

          if (isMounted) {
            setName(data.name ?? "");
            setDesc(data.description ?? "");
            setAppAccess(data.app_access ?? []);
            setActive(data.active);
          }
        } catch (err) {
          if (isMounted) {
            handleBackendError(err, setErrors, showSnackbar);
          }
        } finally {
          if (isMounted) {
            setInitialLoading(false);
          }
        }
      };

      loadData();

      return () => {
        // Cleanup: Hentikan update state jika user pindah screen sebelum API selesai
        isMounted = false;
      };
      // Masukkan dependencies yang relevan
    }, [id, rootPath, basePath, params.updatedField])
  );

  /* ======================================================
     🔥 REALTIME UPDATE DARI MODAL (router.setParams)
     ====================================================== */
  useEffect(() => {
    if (params.updatedField && params.updatedValue !== undefined) {
      const f = params.updatedField;
      const v = params.updatedValue;

      if (f === "name") setName(String(v));
      if (f === "desc") setDesc(String(v));
      if (f === "active") setActive(v === "true" || v === true);

      // ✅ PENTING: Bersihkan params agar Parameter Guard di useFocusEffect 
      // bisa terbuka kembali jika user keluar-masuk halaman ini lagi.
      router.setParams({
        updatedField: undefined,
        updatedValue: undefined,
      });
    }
  }, [params.updatedField, params.updatedValue]);

  const handleUpdate = async (value: boolean) => {
    try {
      const payload = { active: value, rootPath, basePath };
      const res = await updateAksesPengguna(String(id), payload);
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
      const res = await deleteAksesPengguna(String(id), { rootPath, basePath });
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return false;

      showSnackbar("Berhasil dihapus", "success");
      router.replace("/akses_pengguna");
      return true;
    } catch (err) {
      handleBackendError(err, setErrors, showSnackbar);
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
      <AppHeaderActions showBack title="Data Akses Pengguna" />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
      >
        <ConfirmBottomSheet
          visible={confirmVisible}
          title={pendingActiveValue ? "Aktifkan Akun?" : "Nonaktifkan Akun?"}
          message={
            pendingActiveValue
              ? "Apakah Anda yakin ingin mengaktifkan Akses Pengguna ini?"
              : "Apakah Anda yakin ingin menonaktifkan Akses Pengguna ini?"
          }
          confirmText="Ya, Lanjutkan"
          cancelText="Batal"
          onConfirm={async () => {
            setConfirmVisible(false);
            const prev = active;
            setActive(pendingActiveValue);
            const ok = await handleUpdate(pendingActiveValue);
            if (!ok) setActive(prev);
          }}
          onCancel={() => {
            setConfirmVisible(false);
            setActive(active);
          }}
        />

        <ConfirmBottomSheet
          visible={confirmDeleteVisible}
          title="Hapus Akses Pengguna?"
          message="Apakah Anda yakin ingin menghapus Pengguna ini?"
          confirmText="Ya, Hapus"
          onCancel={() => setConfirmDeleteVisible(false)}
          onConfirm={handleDelete}
        />

        <SectionListCard
          title=""
          style={{ marginTop: 16 }}
          items={[
            {
              label: "Status Halaman",
              value: active ? "Aktif" : "Nonaktif",
              right: () => (
                <ToggleSwitch
                  value={active}
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
          title=""
          items={[
            {
              label: "Nama Akses",
              value: name || "Atur Sekarang",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () =>
                router.push({
                  pathname: "/akses_pengguna/edit/modal/[field]",
                  params: { id, field: "name", label: "Nama Akses", value: name, rootPath, basePath },
                }),
            },
            {
              label: "Deskripsi",
              value: desc || "Atur Sekarang",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () =>
                router.push({
                  pathname: "/akses_pengguna/edit/modal/[field]",
                  params: { id, field: "desc", label: "Deskripsi", value: desc, rootPath, basePath },
                }),
            },
          ]}
        />

        <SectionListCard
          title="Pengaturan Akses Aplikasi"
          items={[
            {
              label: "Atur Akses Produksi",
              value: "",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () =>
                router.push({
                  pathname: "", // Isi dengan path yang benar jika sudah ada
                  params: { roleId: id, rootPath, basePath },
                }),
            },
            {
              label: "Atur Akses Admin",
              value: "",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () =>
                router.push({
                  pathname: "/akses_pengguna/edit/modal/akses_admin",
                  params: { roleId: id, rootPath, basePath },
                }),
            },
          ]}
        />

        <SectionListCard
          title=""
          items={[
            {
              label: "Hapus Data Akses Pengguna",
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
  loadingOverlay: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});