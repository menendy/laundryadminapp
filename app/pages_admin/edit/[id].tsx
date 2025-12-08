import React, { useState, useEffect } from "react";
import {
  View, ScrollView, Text, Pressable, Platform
} from "react-native";
import { Button, Portal } from "react-native-paper";
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

import CustomTooltip from "../../../components/ui/CustomTooltip";

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

  // NEW — same structure as add.tsx
  const [useRole, setuseRole] = useState(false);
  const [canViewBy, setcanViewBy] = useState(true);

  const [permissionList, setPermissionList] = useState<any[]>([]);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [prevPath, setPrevPath] = useState("");

  useEffect(() => {
    loadDetail();
  }, []);

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
      setuseRole(d.useRole ?? true);

      setcanViewBy(
        Array.isArray(d.can_view_by)
          ? !d.can_view_by.includes("owner")
          : true
      );


      setPermissionList(
        Object.entries(d.permissions_type || {}).map(([url, perm]: any) => ({
          url,
          permission: perm,
          originalUrl: url,
          originalPermission: perm,
          isEdited: false,
          isDeleted: false,
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

  const updatePermission = (index: number, key: string, value: any) => {
    setPermissionList((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [key]: value, isEdited: true }
          : row
      )
    );
  };

  useEffect(() => {
    if (!path.trim() || !prevPath.trim()) return;
    if (path === prevPath) return;

    setPermissionList((prev) =>
      prev.map((item) => ({
        ...item,
        url: replacePrefix(item.url, prevPath, path),
        isEdited: true,
      }))
    );

    setPrevPath(path);
  }, [path]);

  useEffect(() => {
    if (!useRole) {
      setPermissionModalVisible(false);
    }
  }, [useRole]);

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

    if (useRole && Object.keys(permission_type).length === 0) {
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

      const toUpdate = permissionList
        .filter((x) => x.originalUrl && x.isEdited && !x.isDeleted)
        .map((x) => ({
          originalUrl: x.originalUrl,
          originalPermission: x.originalPermission,
          url: x.url,
          permission: x.permission,
        }));


      const payload = {
        id: pageId,
        name: name.trim(),
        path: path.trim(),
        component: component.trim(),
        active,

        canViewBy: (canViewBy ? ["sysadmin"] : ["sysadmin", "owner"]),
        permission_type,
        sync_permissions_diff: {
          update: toUpdate,
        },
        useRole,
      };


      const res = await updatePageAdmin(payload);
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Halaman berhasil diperbarui", "success");
      router.back();
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
        <ValidatedInput label="Nama Halaman" required value={name} onChangeText={setName} error={errors.name} />
        <ValidatedInput label="Path Routing" required value={path} onChangeText={setPath} error={errors.path} />
        <ValidatedInput label="Component Name" required value={component} onChangeText={setComponent} error={errors.component} />

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "700" }}>Status Halaman</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ToggleSwitch value={active} onChange={setActive} />
            <Text style={{ marginLeft: 10 }}>{active ? "Aktif" : "Nonaktif"}</Text>
          </View>
        </View>


        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
          <Text style={{ fontWeight: "700" }}>
            Hanya bisa dilihat dan diedit sysadmin
          </Text>

          <CustomTooltip message="Akses halaman dibatasi hanya bisa di konfigurasi oleh role Sysadmin">
            <Ionicons
              name="help-circle-outline"
              size={18}
              color="#666"
              style={{ marginLeft: 6 }}
            />
          </CustomTooltip>
        </View>

        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
          <ToggleSwitch value={canViewBy} onChange={setcanViewBy} />
          <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "600" }}>
            {canViewBy ? "Ya" : "Tidak"}
          </Text>
        </View>

        {errors.canViewBy && (
          <Text style={{ color: "red", marginTop: 6 }}>{errors.canViewBy}</Text>
        )}
        {/* Role-Based Access */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
          <Text style={{ fontWeight: "700" }}>
            Perlu pengaturan Role ?
          </Text>

          <CustomTooltip message="Akses pengguna dapat ditentukan berdasarkan role yang dimiliki.">
            <Ionicons
              name="help-circle-outline"
              size={18}
              color="#666"
              style={{ marginLeft: 6 }}
            />
          </CustomTooltip>
        </View>

        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
          <ToggleSwitch value={useRole} onChange={setuseRole} />
          <Text style={{ marginLeft: 10 }}>{useRole ? "Ya" : "Tidak"}</Text>

        </View>

        {useRole && (
          <>
            <Pressable
              onPress={() => {
                if (!path.trim()) {
                  setErrors((prev: any) => ({ ...prev, perm: "Isi Path Routing dulu" }));
                  showSnackbar("Isi Path Routing terlebih dahulu", "error");
                  return;
                }

                setErrors((prev: any) => ({ ...prev, perm: null }));
                setPermissionModalVisible(true);
              }}
              style={{
                marginTop: 30,
                paddingVertical: 4,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 16 }}>
                Tipe Permission
              </Text>
              <Ionicons name="chevron-forward" size={22} color="#333" />
            </Pressable>

            {permissionList.length > 0 && (
              <Text style={{ marginTop: 4, color: "#666" }}>
                {permissionList.length} izin dibuat
              </Text>
            )}

            {errors.perm && <Text style={{ color: "red" }}>{errors.perm}</Text>}
          </>
        )}

        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={loading}
          style={{ marginTop: 30 }}
        >
          Update Halaman
        </Button>
      </ScrollView>

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
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
            >
              <Button
                mode="contained"
                onPress={() =>
                  setPermissionList([
                    {
                      url: `${path}/`,
                      permission: "",
                      isDeleted: false,
                      isEdited: true,
                    },
                    ...permissionList,
                  ])
                }
              >
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
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "600" }}>
                        Permission #{idx + 1}
                      </Text>

                      <Pressable
                        onPress={() => updatePermission(idx, "isDeleted", true)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#cc0000"
                        />
                      </Pressable>
                    </View>

                    <Text style={{ marginTop: 10, fontWeight: "600" }}>Url</Text>
                    <ValidatedInput
                      value={row.url}
                      onChangeText={(v) =>
                        updatePermission(idx, "url", v)
                      }
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
                position: "absolute",
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
                onPress={() => setPermissionModalVisible(false)}
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
