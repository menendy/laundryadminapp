import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addGroup } from "../../services/api/groupsService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddGroupScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [ownerId, setOwnerId] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: any = {};

    if (!ownerId.trim()) e.ownerId = "Owner wajib diisi";

    if (!name.trim()) e.name = "Nama group wajib diisi";
    if (!desc.trim()) e.desc = "Deskripsi wajib diisi";

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

      const result = await addGroup({
        owner_id: ownerId.trim(),
        name: name.trim(),
        description: desc.trim(),
      });

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar(result.message ?? "Group ditambahkan", "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error addGroup:", err);
      showSnackbar("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Group" showBack />

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
          label="Nama Group"
          required
          placeholder="Contoh: Depok Raya"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Deskripsi"
          required
          placeholder="Contoh: Area Depok dan sekitarnya"
          value={desc}
          onChangeText={setDesc}
          error={errors.desc}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          {loading ? "Menyimpan..." : "Tambah Group"}
        </Button>
      </ScrollView>
    </View>
  );
}
