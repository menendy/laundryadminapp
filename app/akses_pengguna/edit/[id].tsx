import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { Button, Chip } from "react-native-paper";
import { useRouter, useLocalSearchParams,usePathname  } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import ValidatedInput from "../../../components/ui/ValidatedInput";
import {
  getAksesPenggunaById,
  updateAksesPengguna,
  PermissionItem,
} from "../../../services/api/aksesPenggunaService";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { handleBackendError } from "../../../utils/handleBackendError";
import { useRolePermissionStore } from "../../../store/useRolePermissionStore";
import { useBasePath } from "../../../utils/useBasePath";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";



export default function EditAksesPenggunaScreen() {
  const { id } = useLocalSearchParams();       // id role dari URL
  const router = useRouter();
 

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  

  const { rootBase: rootPath, basePath } = useBasePath();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [active, setActive] = useState(true);
  const [appAccess, setAppAccess] = useState<string[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const permissions = useRolePermissionStore((s) => s.permissions);
  const setPermissions = useRolePermissionStore((s) => s.setPermissions);
  const resetPermissions = useRolePermissionStore((s) => s.resetPermissions);

// PRELOAD DATA ROLE
useEffect(() => {
  (async () => {
    if (!id) return;

    try {
      setInitialLoading(true);

      //console.log("pathname:", pathname);
      const data = await getAksesPenggunaById(String(id),rootPath,basePath);
      if (!data) return;

      setName(data.name ?? "");
      setDesc(data.description ?? "");
      setAppAccess(data.app_access ?? []);
      setActive(data.active);

      const permsArray: PermissionItem[] = data.permissions ?? [];
      const mapped: Record<string, string[]> = {};

      permsArray.forEach((p) => {
        if (!p || !p.page_id) return;
        mapped[p.page_id] = Array.isArray(p.actions) ? p.actions : [];
      });

      console.log("🔥 Set permissions to store:", mapped);

      resetPermissions();
      setPermissions(mapped);

    } catch (err) {
      console.error("🔥 load role error:", err);
      showSnackbar("Gagal memuat data role", "error");
    } finally {
      setInitialLoading(false);
    }
  })();
}, [id]);

  const toggleAccess = (val: string) => {
    setAppAccess((curr) =>
      curr.includes(val) ? curr.filter((x) => x !== val) : [...curr, val]
    );
  };

  const validate = () => {
    const e: any = {};
    if (!name.trim()) e.name = "Nama akses wajib diisi";
    if (!desc.trim()) e.desc = "Deskripsi wajib diisi";
    if (appAccess.length === 0) e.access = "Pilih minimal 1 access";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      // ubah permissions (object) → array {page_id, actions}
      const formattedPermissions: PermissionItem[] = Object.entries(permissions).map(
        ([page_id, actions]) => ({
          page_id,
          actions: actions ?? [],
        })
      );

      const payload = {
        name: name.trim(),
        description: desc.trim(),
        appAccess,
        active,
        permissions: formattedPermissions,
        rootPath, basePath,
      };

      const result = await updateAksesPengguna(String(id), payload);

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Berhasil diperbarui", "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error update:", err);
      handleBackendError(err, setErrors, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Memuat data role...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Edit Role" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Nama Akses"
          required
          placeholder="Supervisor, Kasir, Admin..."
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Deskripsi"
          required
          placeholder="Deskripsi Akses"
          value={desc}
          onChangeText={setDesc}
          error={errors.desc}
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
    

        <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: "600" }}>
          App Access
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Chip
            selected={appAccess.includes("admin")}
            onPress={() => toggleAccess("admin")}
          >
            Admin Dashboard
          </Chip>

          <Chip
            selected={appAccess.includes("operational")}
            onPress={() => toggleAccess("operational")}
          >
            Operasional App
          </Chip>
        </View>
        {errors.access && (
          <Text style={{ color: "red", marginTop: 6 }}>{errors.access}</Text>
        )}

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/akses_pengguna/akses_admin",
              params: { roleId: id }, // 🔥 kirim id ke akses_admin
            })
          }
          style={{
            marginTop: 30,
            paddingVertical: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 14,
            borderColor: "#ddd",
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Atur Halaman Admin
          </Text>
          <Ionicons name="chevron-forward" size={22} color="#333" />
        </Pressable>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </ScrollView>
    </View>
  );
}
