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
  getOwnerById,
  updateOwner,
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

  const [errors, setErrors] = useState<any>({});

  const [data, setData] = useState<OwnerFormData>({
    name: "",
    phone: "",
    email: "",
  });

  /* ================= LOAD DATA ================= */

  const loadData = async () => {
    try {
      const res = await getOwnerById(String(id), rootPath, basePath);

      setData({
        name: res.name,
        phone: res.phone?.replace(/^(\+62|62)/, "") ?? "",
        email: res.email,
      });

      setActive(res.active);
    } catch (err) {
      handleBackendError(err, setErrors, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  /* ================= REALTIME UPDATE FROM MODAL ================= */

  useEffect(() => {
    if (!params.updatedField) return;

    const f = params.updatedField;
    const v = params.updatedValue ?? "";

    if (f === "name") setData((p) => ({ ...p, name: v }));
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
      pathname: "/owners/edit/modal/[field]",
      params: { id, field, label, value, rootPath, basePath },
    });

  const handleUpdateStatus = async (value: boolean) => {
    try {
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
      <AppHeaderActions showBack title="Data Owner" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <ConfirmBottomSheet
          visible={confirmVisible}
          title={pendingActive ? "Aktifkan Akun Owner?" : "Nonaktifkan Akun Owner?"}
          message={
            pendingActive
              ? "Akun owner akan diaktifkan dan dapat mengakses sistem."
              : "Akun owner akan dinonaktifkan dan tidak dapat login."
          }
          confirmText="Ya, Lanjutkan"
          cancelText="Batal"
          onConfirm={async () => {
            setConfirmVisible(false);
            const ok = await handleUpdateStatus(pendingActive);
            if (ok) setActive(pendingActive);
          }}
          onCancel={() => setConfirmVisible(false)}
        />

        {/* === SECTION 1: STATUS === */}
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

        {/* === SECTION 2: DATA OWNER === */}
        <SectionListCard
          title="Data Owner"
          items={[
            {
              label: "Nama Owner",
              value: data.name || "Atur Sekarang",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () => goEdit("name", "Nama Owner", data.name),
            },
            {
              label: "Nomor Telepon",
              value: data.phone ? `+62${data.phone}` : "Atur Sekarang",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () => goEdit("phone", "Nomor Telepon", data.phone),
            },
            {
              label: "Email",
              value: data.email || "Atur Sekarang",
              right: () => <List.Icon icon="chevron-right" />,
              onPress: () => goEdit("email", "Email", data.email),
            },
          ]}
        />
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F4" },
  scroll: { flex: 1 },
});
