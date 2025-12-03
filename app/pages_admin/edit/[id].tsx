import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable, Platform, Animated, TouchableOpacity } from "react-native";
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
import ToggleSwitch from "../../../components/ui/ToggleSwitch";

export default function EditPageAdminScreen() {
  const { id } = useLocalSearchParams();
  const pageId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");

  const [active, setActive] = useState(true);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [canViewBy, setcanViewBy] = useState<boolean>(true);

  const [permissionList, setPermissionList] = useState<any[]>([]);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const [prevPath, setPrevPath] = useState("");


  const logPermissionDiff = () => {
    const toInsert = permissionList.filter(x => !x.originalUrl && !x.isDeleted);
    const toUpdate = permissionList.filter(x => x.originalUrl && x.isEdited && !x.isDeleted);
    const toDelete = permissionList.filter(x => x.originalUrl && x.isDeleted);

    console.group("🔍 Permission Diff (Modal Closed)");

    console.log("✨ NEW / Insert:");
    console.table(toInsert.map(x => ({ url: x.url, permission: x.permission })));

    console.log("✏️ UPDATED / Edited:");
    console.table(toUpdate.map(x => ({
      oldUrl: x.originalUrl,
      newUrl: x.url,
      oldPerm: x.originalPermission,
      newPerm: x.permission,
    })));

    console.log("🗑️ DELETED / Removed:");
    console.table(toDelete.map(x => ({
      removedUrl: x.originalUrl,
      removedPerm: x.originalPermission,
    })));

    console.log("📌 CURRENT (Saved in Form State):");
    console.table(
      permissionList
        .filter(x => !x.isDeleted)
        .map(x => ({ url: x.url, permission: x.permission }))
    );

    console.groupEnd();
  };


  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await getPageAdminById(String(id));
      const ok = handleBackendError(res, () => { }, showSnackbar);
      if (!ok) return;

      const d = res.data;

      setName(d.name ?? "");
      setPath(d.path ?? "");
      setComponent(d.component ?? "");
      setActive(d.active ?? true);

      const canViewArr = Array.isArray(d.can_view_by) ? d.can_view_by : [];
      const calculatedIsPublic = d.is_public !== undefined ? d.is_public : canViewArr.length === 0;
      const calculatedCanViewBy = calculatedIsPublic ? true : !canViewArr.includes("owner");

      setIsPublic(calculatedIsPublic);
      setcanViewBy(calculatedCanViewBy);

      // === PERMISSIONS LOAD ===
      setPermissionList(
        Object.entries(d.permissions_type || {}).map(([url, perm]: any) => ({
          url,
          permission: perm,
          originalUrl: url,
          originalPermission: perm,
          isEdited: false,
          isDeleted: false,
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
      prev.map((item) =>
      ({
        ...item,
        url: replacePrefix(item.url, prevPath, path),
        isEdited: true,
      })
      )
    );

    setPrevPath(path);
  }, [path]);

  const addPermissionRow = () => {
    setPermissionList((prev) => [
      {
        url: `${path}/`,
        permission: "",
        isDeleted: false,
        isEdited: true,
      },
      ...prev,
    ]);
  };

  const updatePermission = (index: number, key: string, value: string) => {
    setPermissionList((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [key]: value, isEdited: true } : row
      )
    );
  };

  const markDeletePermission = (index: number) => {
    setPermissionList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isDeleted: true } : item
      )
    );
  };

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Nama halaman wajib diisi";
    if (!path.trim()) e.path = "Path wajib diisi";
    if (!component.trim()) e.component = "Component wajib diisi";

    const permission_type = Object.fromEntries(
      permissionList
        .filter((x) => !x.isDeleted && x.url?.trim() && x.permission?.trim())
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
          .filter((x) => !x.isDeleted && x.url && x.permission)
          .map((x) => [x.url, x.permission])
      );

      const toInsert = permissionList
        .filter((x) => !x.originalUrl && !x.isDeleted)
        .map((x) => ({
          originalUrl: null,
          originalPermission: null,
          url: x.url,
          permission: x.permission,
        }));

      const toUpdate = permissionList
        .filter((x) => x.originalUrl && x.isEdited && !x.isDeleted)
        .map((x) => ({
          originalUrl: x.originalUrl,
          originalPermission: x.originalPermission,
          url: x.url,
          permission: x.permission,
        }));

      const toDelete = permissionList
        .filter((x) => x.originalUrl && x.isDeleted)
        .map((x) => ({
          originalUrl: x.originalUrl,
          originalPermission: x.originalPermission,
          url: null,
          permission: null,
        }));



      const payload = {
        id:pageId,
        name: name.trim(),
        path: path.trim(),
        component: component.trim(),
        active,
        is_public: isPublic,
        canViewBy: isPublic ? [] : (canViewBy ? ["sysadmin"] : ["sysadmin", "owner"]),
        permission_type,
        sync_permissions_diff: {
          update: toUpdate
        }
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
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "700", marginBottom: 10 }}>
            Status Halaman
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ToggleSwitch value={active} onChange={setActive} />
            <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "600" }}>
              {active ? "Aktif" : "Nonaktif"}
            </Text>
          </View>
        </View>

        {/* HALAMAN PUBLIK */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "700", marginBottom: 10 }}>
            Halaman Publik ?
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ToggleSwitch value={isPublic} onChange={setIsPublic} />
            <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "600" }}>
              {isPublic ? "Ya" : "Tidak"}
            </Text>
          </View>
        </View>

        {/* SYSADMIN */}
        {!isPublic && (
          <>
            <Text style={{ marginTop: 20, fontWeight: "700" }}>
              Hanya bisa dilihat dan diedit sysadmin
            </Text>

            <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ToggleSwitch value={canViewBy} onChange={setcanViewBy} />
              <Text style={{ fontSize: 15, fontWeight: "600" }}>
                {canViewBy ? "Ya" : "Tidak"}
              </Text>
            </View>
          </>
        )}

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
          style={{ marginTop: 30 }}
        >
          Update Halaman
        </Button>
      </ScrollView>

      {/* PERMISSION MODAL */}
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
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 180 }}>
              <Button mode="contained" onPress={addPermissionRow}>
                Tambah tipe
              </Button>

              {permissionList
                .filter((i) => !i.isDeleted)
                .map((row, idx) => (
                  <View
                    key={idx}
                    style={{
                      marginTop: 20,
                      backgroundColor: "#fafafa",
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: row.isEdited ? 1.5 : 1,
                      borderColor: row.isEdited ? "#007aff" : "#ddd",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontWeight: "600" }}>Permission #{idx + 1}</Text>
                      <Pressable onPress={() => markDeletePermission(idx)}>
                        <Ionicons name="trash-outline" size={22} color="#cc0000" />
                      </Pressable>
                    </View>

                    <Text style={{ fontWeight: "600", marginTop: 10 }}>Url</Text>
                    <ValidatedInput
                      value={row.url}
                      onChangeText={(v) => updatePermission(idx, "url", v)}
                    />

                    <Text style={{ fontWeight: "600", marginTop: 10 }}>Permission</Text>
                    <ValidatedInput
                      value={row.permission}
                      onChangeText={(v) => updatePermission(idx, "permission", v)}
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
              <Button
                mode="contained"
                onPress={() => {
                  setPermissionModalVisible(false);
                  logPermissionDiff(); // 👈 TAMBAHKAN INI
                }}
              >
                Simpan & Tutup
              </Button>

            </View>
          </View>
        )}
      </Portal>
    </View>
  );
}
