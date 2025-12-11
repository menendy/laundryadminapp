import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { ActivityIndicator, List } from "react-native-paper";
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import SectionListCard from "../../../components/ui/SectionListCard";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";

import { getMitraById, updateMitraV2, deleteMitraV2 } from "../../../services/api/mitraService";

import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { useBasePath } from "../../../utils/useBasePath";
import { handleBackendError } from "../../../utils/handleBackendError";
import ConfirmBottomSheet from "../../../modals/ConfirmBottomSheet";


export default function EditKaryawanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const id = params.id;
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const insets = useSafeAreaInsets();
  const { rootBase: rootPath, basePath } = useBasePath();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(true);


  const [rolesAdmin, setRolesAdmin] = useState<string>("");
  const [errors, setErrors] = useState<any>({});
  const [data, setData] = useState<any>({
    name: "",
    alias: "",
    phone: "",
    email: "",
    address: "",
  });

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);


  const [pendingActiveValue, setPendingActiveValue] = useState(active);



  const loadData = async () => {
    try {
      const res = await getMitraById(id as string, rootPath, basePath);
      setData({
        name: res.name,
        alias: res.alias,
        phone: res.phone?.replace(/^(\+62|62)/, ""),
        email: res.email,
        address: res.alamat,
        //roles : res.roleNameAdmin
      });
      setActive(res.active);
      setRolesAdmin(res.roleNameAdmin);

    } catch (err) {

      console.error("🔥 Error add:", err);
      handleBackendError(err, setErrors, showSnackbar);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      if (!loading) loadData();
    }, [loading, saving])
  );


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const goEdit = (field: string, label: string, value: string) =>
    router.push({
      pathname: "/karyawan/edit/modal/[field]",
      params: { id, field, label, value, rootPath, basePath },
    });

  const goEditAksesOps = () =>
    router.push({
      //pathname: "/karyawan/edit/modal/role",
      pathname: "/karyawan/edit/modal/akses_ops",
      params: { id, rootPath, basePath },
    });

  const goEditAksesAdmin = () =>
    router.push({
      //pathname: "/karyawan/edit/modal/role",
      pathname: "/karyawan/edit/modal/akses_admin",
      params: { id, rootPath, basePath },
    });

  const handleDelete = async () => {
    try {
      setSaving(true);
      const payload = { rootPath, basePath };
      const res = await deleteMitraV2(String(id), payload);
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return false;

      showSnackbar("Berhasil dihapus", "success");
      return true;
    } catch (err) {
      handleBackendError(err, setErrors, showSnackbar);
      return false;
    } finally {
      setSaving(false);
    }
  };


  const handleUpdate = async (value: boolean) => {
    try {
      setSaving(true);
      const payload = { active: value, rootPath, basePath };
      const res = await updateMitraV2(String(id), payload);
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

  return (

    

    <View style={styles.container}>
      <AppHeaderActions showBack title="Data Mitra" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ConfirmBottomSheet
          visible={confirmVisible}
          title={pendingActiveValue ? "Aktifkan Akun?" : "Nonaktifkan Akun?"}
          message={
            pendingActiveValue
              ? "Apakah Anda yakin ingin mengaktifkan akun mitra ini?"
              : "Apakah Anda yakin ingin menonaktifkan akun mitra ini?"
          }
          confirmText="Ya, Lanjutkan"
          cancelText="Batal"
          onConfirm={async () => {
            setConfirmVisible(false);
            const prev = active;
            setActive(pendingActiveValue);
            const ok = await handleUpdate(pendingActiveValue);
            // if (!ok) setActive(prev);
          }}
          onCancel={() => {
            setConfirmVisible(false);
            setActive(active); // pastikan revert UI
          }}
        />

        <ConfirmBottomSheet
          visible={confirmDeleteVisible}
          title="Hapus Mitra?"
          message="Apakah Anda yakin ingin menghapus mitra ini?"
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
              router.replace("/karyawan");
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


        <View style={styles.body}>

          <SectionListCard
            style={{ marginTop: 16 }}  // ⬅️ spacing di bagian atas
            title="Status Akun Mitra"
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
                  />),
              },]}
          />

          <SectionListCard
            title="Data Pribadi"
            items={[
              ["name", "Nama Lengkap"],
              ["alias", "Nama Panggilan"],
              ["phone", "No. Handphone"],
              ["email", "Email"],
              ["address", "Alamat"],

            ].map(([field, label]) => ({
              label,
              value:
                field === "phone"
                  ? data[field]
                    ? `+62${data[field]}`
                    : "Atur Sekarang"
                  : data[field] || "Atur Sekarang",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () => goEdit(field, label, data[field]),
            }))}
          />



          <SectionListCard
            title="Pengaturan Akses"
            items={[
              {
                label: "Pengaturan Akses Operasional",
                value: "",
                right: () => <List.Icon icon="chevron-right" />,
                onPress: () => goEditAksesOps(),
              },
              {
                label: "Pengaturan Akses Admin",
                value: rolesAdmin,
                right: () => <List.Icon icon="chevron-right" />,
                onPress: () => goEditAksesAdmin(),
              },
            ]}

          />

          <SectionListCard
            title=""
            items={[
              {
                label: "Hapus Mitra",
                value: "",
                right: () => <List.Icon icon="delete-outline" color="red" />,
                //right: () => <List.Icon icon="chevron-right" />,
                //variant: "centerAction",
                onPress: () => setConfirmDeleteVisible(true),
                labelStyle: {
                  color: "red",
                  fontWeight: "500",
                  fontSize: 15,
                },

                valueStyle: {
                  color: "#777",
                  fontStyle: "italic",
                },
              },
            ]}
          />

        </View>
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
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },


  scroll: {
    flex: 1,
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
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

