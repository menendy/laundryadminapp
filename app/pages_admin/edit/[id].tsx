import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable, Platform } from "react-native";
import { Button, Chip, Portal } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import ValidatedInput from "../../../components/ui/ValidatedInput";
import {
  getPageAdminById,
  updatePageAdmin,
} from "../../../services/api/pagesAdminService";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { handleBackendError } from "../../../utils/handleBackendError";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditPageAdminScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");

  const [active, setActive] = useState(true);
  const [canViewBy, setcanViewBy] = useState<boolean>(true);

  const [permissionList, setPermissionList] = useState<any[]>([]);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const [prevPath, setPrevPath] = useState("");

  const defaultPermissionTemplates = [
    { id: "read", suffix: "", permission: "baca" },
    { id: "add", suffix: "add", permission: "tambah" },
    { id: "edit", suffix: "edit", permission: "ubah" },
    { id: "delete", suffix: "delete", permission: "hapus" },
  ];

  // Load existing data
  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await getPageAdminById(String(id));
      const ok = handleBackendError(res, () => {}, showSnackbar);
      if (!ok) return;

      const d = res.data;
      setName(d.name);
      setPath(d.path);
      setComponent(d.component);
      setActive(d.active);
      setcanViewBy(d.can_view_by?.includes("sysadmin"));
      setPermissionList(
        Object.entries(d.permissions_type || {}).map(([url, perm]: any) => ({
          url,
          permission: perm,
          isDefault: false,
          defaultId: null,
        }))
      );

      setPrevPath(d.path);
    } finally {
      setLoading(false);
    }
  };

  const replacePrefix = (oldUrl: string, oldPrefix: string, newPrefix: string) => {
    if (!oldUrl.startsWith(oldPrefix)) return oldUrl;
    return newPrefix + oldUrl.slice(oldPrefix.length);
  };

  useEffect(() => {
    if (!path.trim() || !prevPath.trim()) return;
    if (path === prevPath) return;

    setPermissionList((prev) =>
      prev.map((row) => ({
        ...row,
        url: replacePrefix(row.url, prevPath, path),
      }))
    );

    setPrevPath(path);
  }, [path]);

  const addPermissionRow = () => {
    setPermissionList((prev) => [
      {
        url: `${path}/`,
        permission: "",
        isDefault: false,
        defaultId: null,
      },
      ...prev,
    ]);
  };

  const updatePermission = (index: number, key: string, value: string) => {
    setPermissionList((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Nama halaman wajib diisi";
    if (!path.trim()) e.path = "Path wajib diisi";
    if (!component.trim()) e.component = "Component wajib diisi";

    const permission_type = Object.fromEntries(
      permissionList
        .filter((x) => x.url?.trim() && x.permission?.trim())
        .map((x) => [x.url.trim(), x.permission.trim()])
    );

    if (Object.keys(permission_type).length === 0) {
      e.perm = "Minimal 1 permission harus diatur";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      const permission_type = Object.fromEntries(
        permissionList
          .filter((x) => x.url && x.permission)
          .map((x) => [x.url, x.permission])
      );

      const payload = {
        id,
        name: name.trim(),
        path: path.trim(),
        component: component.trim(),
        active,
        canViewBy: canViewBy ? ["sysadmin"] : ["sysadmin", "owner"],
        permission_type,
      };

      const res = await updatePageAdmin(payload);
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Halaman berhasil diperbarui", "success");
      router.back();
    } catch (err) {
      handleBackendError(err, setErrors, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Edit Halaman Admin" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Nama Halaman"
          required
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Path Routing"
          required
          value={path}
          onChangeText={setPath}
          error={errors.path}
        />

        <ValidatedInput
          label="Component Name"
          required
          value={component}
          onChangeText={setComponent}
          error={errors.component}
        />

        {/* STATUS */}
        <Text style={{ marginTop: 20, fontWeight: "700" }}>Status Halaman</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Chip selected={active} onPress={() => setActive(true)}>
            Aktif
          </Chip>
          <Chip selected={!active} onPress={() => setActive(false)}>
            Nonaktif
          </Chip>
        </View>

        {/* SYSADMIN */}
        <Text style={{ marginTop: 20, fontWeight: "700" }}>
          Hanya bisa dilihat sysadmin?
        </Text>

        <View style={{ marginTop: 12, gap: 12 }}>
          <Pressable
            onPress={() => setcanViewBy(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <Ionicons
              name={canViewBy ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={canViewBy ? "#007aff" : "#777"}
            />
            <Text>Ya</Text>
          </Pressable>

          <Pressable
            onPress={() => setcanViewBy(false)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <Ionicons
              name={!canViewBy ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={!canViewBy ? "#007aff" : "#777"}
            />
            <Text>Tidak</Text>
          </Pressable>
        </View>

        {/* PERMISSION MODAL TRIGGER */}
        <Pressable
          onPress={() => setPermissionModalVisible(true)}
          style={{
            marginTop: 30,
            paddingVertical: 4,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>Tipe Permission</Text>
          <Ionicons name="chevron-forward" size={22} color="#333" />
        </Pressable>

        {errors.perm && <Text style={{ color: "red" }}>{errors.perm}</Text>}

        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 30 }}
        >
          {loading ? "Menyimpan..." : "Update Halaman"}
        </Button>
      </ScrollView>

      {/* ============= Permission Modal ============= */}
      <Portal>
        {permissionModalVisible && (
          <View
            style={{
              position: Platform.OS === "web" ? "fixed" : "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#fff",
              paddingTop: 50,
              zIndex: 9999,
            }}
          >
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }}>
              <Button mode="contained" onPress={addPermissionRow}>
                Tambah tipe
              </Button>

              {permissionList.map((row, idx) => (
                <View
                  key={idx}
                  style={{
                    marginTop: 20,
                    backgroundColor: "#fafafa",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Url</Text>
                  <ValidatedInput
                    value={row.url}
                    onChangeText={(v) => updatePermission(idx, "url", v)}
                  />

                  <Text style={{ marginTop: 10, fontWeight: "600" }}>
                    Permission
                  </Text>
                  <ValidatedInput
                    value={row.permission}
                    onChangeText={(v) =>
                      updatePermission(idx, "permission", v)
                    }
                  />
                </View>
              ))}
            </ScrollView>

            <View
              style={{
                position: Platform.OS === "web" ? "fixed" : "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: 20,
                paddingBottom: 20 + insets.bottom,
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Button mode="contained" onPress={() => setPermissionModalVisible(false)}>
                Simpan & Tutup
              </Button>
            </View>
          </View>
        )}
      </Portal>
    </View>
  );
}
