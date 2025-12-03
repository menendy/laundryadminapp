import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { Button, Chip } from "react-native-paper";
import { useRouter,usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addAksesPengguna } from "../../services/api/aksesPenggunaService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";
import { useRolePermissionStore } from "../../store/useRolePermissionStore";



export default function AddAksesPenggunaScreen() {

  const resetPermissions = useRolePermissionStore((s) => s.resetPermissions);

    useEffect(() => {
    resetPermissions(); // 🔥 Mulai fresh di mode ADD
  }, []);

  const router = useRouter();
  const pathname = usePathname();
 
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);


  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");



  const [appAccess, setAppAccess] = useState<string[]>([]);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

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


  const { permissions } = useRolePermissionStore.getState();

  const formattedPermissions = Object.entries(permissions).map(
    ([pageId, actions]) => ({
      page_id: pageId,
      actions,
    })
  );

  const handleSubmit = async () => {
    if (!validate()) {
      // ===== FRONTEND VALIDATION =====
      if (!validate()) { showSnackbar("Lengkapi data dengan benar", "error"); return; }
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        description: desc.trim(),
        appAccess : appAccess,
        permissions: formattedPermissions,
        pathname
      };

      const result = await addAksesPengguna(payload);

      // ============================================================
      // 🔥 UNIVERSAL ERROR HANDLER (Backend + Network)
      // ============================================================
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Halaman berhasil ditambahkan", "success");
      resetPermissions();
      router.back();

    } catch (err) {

      console.error("🔥 Error add:", err);

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
      <AppHeaderActions title="Tambah Akses Pengguna" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>


        <ValidatedInput label="Nama Akses" required placeholder="Supervisor, Kasir, Admin..." value={name} onChangeText={setName} error={errors.name} />

        <ValidatedInput label="Deskripsi" required placeholder="Deskripsi Akses" value={desc} onChangeText={setDesc} error={errors.desc} />


        <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: "600", }} > App Access </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>

          <Chip selected={appAccess.includes("admin")} onPress={() => toggleAccess("admin")} >
            Admin Dashboard
          </Chip>

          <Chip selected={appAccess.includes("operational")} onPress={() => toggleAccess("operational")} >
            Operasional App
          </Chip>

        </View>
        {errors.access && (<Text style={{ color: "red", marginTop: 6 }}>{errors.access}</Text>)}

        <Pressable
          onPress={() => router.push("/akses_pengguna/akses_admin")}
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


        <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading} style={{ marginTop: 20 }} >
          {loading ? "Menyimpan..." : "Tambah Role"}
        </Button>

      </ScrollView>
    </View>
  );

}
