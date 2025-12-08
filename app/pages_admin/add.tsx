import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable, Platform, Switch, Animated, TouchableOpacity } from "react-native";
import { Button, Portal, Tooltip } from "react-native-paper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addPageAdmin } from "../../services/api/pagesAdminService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import CustomTooltip from "../../components/ui/CustomTooltip";




export default function AddPageAdminScreen() {


  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");

  const [active, setActive] = useState(true);




  const [canViewBy, setcanViewBy] = useState(true);

  const [useRole, setuseRole] = useState(false);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  // DEFAULT PERMISSION KEYS
  const defaultPermissionTemplates = [
    { id: "read", suffix: "", permission: "baca" },
    { id: "add", suffix: "add", permission: "tambah" },
    { id: "edit", suffix: "edit", permission: "ubah" },
    { id: "delete", suffix: "delete", permission: "hapus" },
  ];

  const [permissionList, setPermissionList] = useState<any[]>([]);

  // Track previous path
  const [prevPath, setPrevPath] = useState("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (path && path !== prevPath) {
      setPrevPath(path);
    }
  }, [path]);

  const replacePrefix = (oldUrl: string, oldPrefix: string, newPrefix: string) => {
    if (!oldUrl.startsWith(oldPrefix)) return oldUrl;
    return newPrefix + oldUrl.slice(oldPrefix.length);
  };

  // INITIAL default permissions
  useEffect(() => {
    if (!path.trim()) return;

    if (permissionList.length === 0) {
      setPermissionList(
        defaultPermissionTemplates.map((t) => ({
          defaultId: t.id,
          isDefault: true,
          url: t.suffix ? `${path}/${t.suffix}` : `${path}/`,
          permission: t.permission,
        }))
      );
    }
  }, [path]);

  // UPDATE URL ketika path berubah
  useEffect(() => {
    if (!path.trim() || !prevPath.trim()) return;

    setPermissionList((prev) =>
      prev.map((item) => {
        if (item.isDefault && item.defaultId) {
          const mapped = defaultPermissionTemplates.find((t) => t.id === item.defaultId);
          if (!mapped) return item;

          const newUrl = mapped.suffix
            ? `${path}/${mapped.suffix}`
            : `${path}/`;

          return { ...item, url: newUrl };
        }

        // Custom row → update prefix only
        return {
          ...item,
          url: replacePrefix(item.url, prevPath, path),
        };
      })
    );
  }, [path]);

  const addPermissionRow = () => {
    setPermissionList((prev) => [
      {
        url: path ? `${path}/` : "",
        permission: "",
        isDefault: false,
        defaultId: null,
      },
      ...prev,
    ]);
  };

  const updatePermission = (index: number, key: string, value: string) => {
    setPermissionList((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
            ...row,
            [key]: value,
            isDefault: false,
            defaultId: null,
          }
          : row
      )
    );
  };

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Nama halaman wajib diisi";
    if (!path.trim()) e.path = "Path wajib diisi";
    if (!component.trim()) e.component = "Component wajib diisi";

    // Buat ulang permission_type untuk validasi
    const permission_type = Object.fromEntries(
      permissionList
        .filter((x) => x.url?.trim() && x.permission?.trim())
        .map((x) => [x.url.trim(), x.permission.trim()])
    );

    // Validasi minimal satu permission valid
    if (Object.keys(permission_type).length === 0) {
      e.perm = "Minimal 1 permission harus diatur";
    }


    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (!useRole) {
      setPermissionModalVisible(false);
    }
  }, [useRole]);

  const handleSubmit = async () => {
    // ===== FRONTEND VALIDATION =====
    if (!validate()) { showSnackbar("Lengkapi data dengan benar", "error"); return; }

    try {
      setLoading(true);

      const permission_type = Object.fromEntries(permissionList.filter((x) => x.url && x.permission).map((x) => [x.url, x.permission]));

      const payload = {
        name: name.trim(),
        path: path.trim(),
        component: component.trim(),
        active,
        canViewBy: (canViewBy ? ["sysadmin"] : ["sysadmin", "owner"]),
        permission_type: permission_type, 
        useRole: useRole,
      };


      const result = await addPageAdmin(payload);

      // ============================================================
      // 🔥 UNIVERSAL ERROR HANDLER (Backend + Network)
      // ============================================================
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Halaman berhasil ditambahkan", "success");
      router.back();

    } catch (err) {
      console.error("🔥 Error addPageAdmin:", err);

      // ============================================================
      // 🔥 Global catch (NETWORK ERROR / AXIOS ERROR)
      // ============================================================
      handleBackendError(err, setErrors, showSnackbar);

    } finally {
      setLoading(false);
    }
  };





  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Halaman Admin" showBack />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 180, // ruang tambahan agar konten terakhir aman
        }}
        showsVerticalScrollIndicator={false}
      >

        <ValidatedInput
          label="Nama Halaman"
          required
          value={name}
          onChangeText={setName}
          placeholder="Finance, Dashboard, Report..."
          error={errors.name}
        />

        <ValidatedInput
          label="Path Routing"
          required
          value={path}
          onChangeText={(v) => {
            setPath(v);
            if (errors.path || errors.perm) {
              setErrors((prev: any) => ({ ...prev, path: null, perm: null }));
            }
          }}
          placeholder="/finance"
          error={errors.path}
        />

        <ValidatedInput
          label="Component Name"
          required
          value={component}
          onChangeText={setComponent}
          placeholder="FinanceScreen"
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

          {errors.active && (
            <Text style={{ color: "red", marginTop: 6 }}>{errors.active}</Text>
          )}
        </View>







        <>
          {/* Only Sysadmin Access */}
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
            <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "600" }}>
              {useRole ? "Ya" : "Tidak"}
            </Text>
          </View>

          {errors.canViewBy && (
            <Text style={{ color: "red", marginTop: 6 }}>{errors.canViewBy}</Text>
          )}
        </>






        {/* OPEN PERMISSION MODAL — only if useRole enabled */}
        {useRole && (
          <>
            <Pressable
              onPress={() => {
                if (!path.trim()) {
                  setErrors((prev: any) => ({
                    ...prev,
                    perm: "Isi Path Routing terlebih dahulu",
                  }));
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
              <Text style={{ color: "#666", marginTop: 4 }}>
                {permissionList.length} izin dibuat
              </Text>
            )}

            {errors.perm && (
              <Text style={{ color: "red" }}>{errors.perm}</Text>
            )}
          </>
        )}


        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 30 }}
        >
          {loading ? "Menyimpan..." : "Tambah Halaman"}
        </Button>
      </ScrollView>

      {/* ========================================================= */}
      {/* 🔥 PORTAL MODAL — THIS FIXES BOTTOM NAV OVERLAY */}
      {/* ========================================================= */}
      <Portal>
        {permissionModalVisible && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#fff",
              paddingTop: 50,
              zIndex: 999999,
              elevation: 999999,
              pointerEvents: "auto",
            }}
          >

            {/* Header */}
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700" }}>
                Atur Permission
              </Text>

              <Pressable onPress={() => setPermissionModalVisible(false)}>
                <Ionicons name="close" size={26} color="#333" />
              </Pressable>
            </View>

            {/* Scroll Body */}
            <ScrollView
              contentContainerStyle={{
                padding: 20,
                paddingBottom: useRole ? 260 : 180,
              }}
            >
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
                    elevation: 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      Permission #{idx + 1}
                    </Text>

                    <Pressable
                      onPress={() =>
                        setPermissionList((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#cc0000"
                      />
                    </Pressable>
                  </View>

                  <Text style={{ fontWeight: "600" }}>Url</Text>
                  <ValidatedInput
                    value={row.url}
                    onChangeText={(v) => updatePermission(idx, "url", v)}
                    placeholder={`${path}/custom`}
                  />

                  <Text style={{ marginTop: 10, fontWeight: "600" }}>
                    Permission
                  </Text>
                  <ValidatedInput

                    value={row.permission}
                    onChangeText={(v) =>
                      updatePermission(idx, "permission", v)
                    }
                    placeholder="hak akses"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Fixed Bottom Button */}
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
                zIndex: 1000000,
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
