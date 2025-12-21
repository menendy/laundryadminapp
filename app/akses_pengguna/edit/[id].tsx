import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { List, ActivityIndicator } from "react-native-paper";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import SectionListCard from "../../../components/ui/SectionListCard";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";

import { getAksesPenggunaById, deleteAksesPengguna } from "../../../services/api/aksesPenggunaService";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { useBasePath } from "../../../utils/useBasePath";
import ConfirmBottomSheet from "../../../modals/ConfirmBottomSheet";
import { updateAksesPengguna } from "../../../services/api/aksesPenggunaService";
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

  const loadData = async () => {
    try {


      const data = await getAksesPenggunaById(String(id), rootPath, basePath);

      setName(data.name ?? "");
      setDesc(data.description ?? "");
      setAppAccess(data.app_access ?? []);
      setActive(data.active);
    } catch (err) {
      showSnackbar("Gagal memuat data akses pengguna", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  // ======================================================
  // 🔥 REALTIME UPDATE DARI MODAL (router.setParams)
  // ======================================================
  useEffect(() => {
    

    if (params.updatedField && params.updatedValue !== undefined) {
      //console.log("Realtime update ⬅️", params.updatedField, params.updatedValue);

      if (params.updatedField === "name") setName(String(params.updatedValue));
      if (params.updatedField === "desc") setDesc(String(params.updatedValue));
      if (params.updatedField === "active") setActive(Boolean(params.updatedValue));

      // reset untuk hindari efek looping
      router.setParams({
        updatedField: undefined,
        updatedValue: undefined,
      });
    }
  }, [params.updatedField, params.updatedValue]);


  useEffect(() => {
  }, [name, desc, active]);

  const handleUpdate = async (value: boolean) => {
    try {
      //setSaving(true);
      const payload = { active: value, rootPath, basePath };
      const res = await updateAksesPengguna(String(id), payload);
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return false;
      showSnackbar("Status diperbarui", "success");
      return true;
    } catch (err) {
      handleBackendError(err, setErrors, showSnackbar);
      return false;
    } finally {
      //setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      const res = await deleteAksesPengguna(String(id), { rootPath, basePath });
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return false;
      showSnackbar("Berhasil dihapus", "success");
      return true;
    } finally {
      setSaving(false);
    }
  };


  // ======================================================

  if (initialLoading) {

    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
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
            setActive(active); // pastikan revert UI
          }}
        />

        <ConfirmBottomSheet
          visible={confirmDeleteVisible}
          title="Hapus Akses Pengguna?"
          message="Apakah Anda yakin ingin menghapus Pengguna ini?"
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={async () => {
            setConfirmDeleteVisible(false);

            const prev = active; // simpan state lama untuk rollback jika perlu
            try {
              //setSaving(true);

              // panggil API delete
              const ok = await handleDelete();
              if (!ok) {
                setActive(prev); // rollback UI kalau gagal
                return;
              }

              showSnackbar("Berhasil dihapus", "success");

              // kembali ke halaman daftar
              router.replace("/akses_pengguna");
            } catch (err) {
              handleBackendError(err, setErrors, showSnackbar);
              setActive(prev);
            } finally {
              //setSaving(false);
            }
          }}

          onCancel={() => {
            setConfirmDeleteVisible(false);
          }}
        />

        {/* STATUS */}
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
                  //disabled={saving}
                  onChange={(val) => {
                    setPendingActiveValue(val);
                    setConfirmVisible(true);
                  }}
                />),
            },
          ]}
        />

        {/* NAME + DESC */}
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
                  params: {
                    id,
                    field: "name",
                    label: "Nama Akses",
                    value: name,
                    rootPath,
                    basePath,
                  },
                }),
            },
            {
              label: "Deskripsi",
              value: desc || "Atur Sekarang",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () =>
                router.push({
                  pathname: "/akses_pengguna/edit/modal/[field]",
                  params: {
                    id,
                    field: "desc",
                    label: "Deskripsi",
                    value: desc,
                    rootPath,
                    basePath,
                  },
                }),
            },
          ]}
        />

        {/* PERMISSIONS */}
        <SectionListCard
          title="Pengaturan Akses Aplikasi"
          items={[
            {
              label: "Atur Akses Produksi",
              value: "",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () =>
                router.push({
                  pathname: "",
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

        {/* DELETE */}
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
