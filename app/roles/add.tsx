import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import {  Text, Button, Chip } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addRole } from "../../services/api/rolesService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddRoleScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [ownerId, setOwnerId] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [type, setType] = useState<"system" | "operational">("system");

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

    if (!ownerId.trim()) e.ownerId = "Owner wajib diisi";
    if (!name.trim()) e.name = "Nama role wajib diisi";
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

      const result = await addRole({
        owner_id: ownerId.trim(),
        name: name.trim(),
        description: desc.trim(),
        type,
        app_access: appAccess,
      });

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Role sukses ditambahkan", "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error addRole:", err);
      showSnackbar("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Role" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Owner ID"
          required
          placeholder="OWNER_A"
          value={ownerId}
          onChangeText={setOwnerId}
          error={errors.ownerId}
        />

        <ValidatedInput
          label="Nama Role"
          required
          placeholder="Supervisor, Kasir, Admin..."
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Deskripsi"
          required
          placeholder="Deskripsi role"
          value={desc}
          onChangeText={setDesc}
          error={errors.desc}
        />

        <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: "600" }}>
          Tipe Role
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Chip
            selected={type === "system"}
            onPress={() => setType("system")}
          >
            System
          </Chip>

          <Chip
            selected={type === "operational"}
            onPress={() => setType("operational")}
          >
            Operational
          </Chip>
        </View>

        <Text
          style={{
            marginTop: 20,
            marginBottom: 10,
            fontWeight: "600",
          }}
        >
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

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          {loading ? "Menyimpan..." : "Tambah Role"}
        </Button>
      </ScrollView>
    </View>
  );
}
