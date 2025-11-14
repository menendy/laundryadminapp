import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { addOutlet } from "../../services/api/outletsService";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddOutletScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [groupId, setGroupId] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e: any = {};
    if (!name.trim()) e.name = "Nama Outlet wajib diisi";
    if (!phone.trim()) e.phone = "Nomor telepon wajib diisi";
    if (!address.trim()) e.address = "Alamat wajib diisi";
    if (!ownerId.trim()) e.ownerId = "Owner wajib dipilih";
    if (!groupId.trim()) e.groupId = "Group wajib dipilih";
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

      const result = await addOutlet({
        owner_id: ownerId,
        group_id: groupId,
        name,
        address,
        phone,
      });

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar(result.message, "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error add outlet:", err);
      showSnackbar("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Outlet" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Owner ID"
          required
          placeholder="Misal: OWNER_A"
          value={ownerId}
          onChangeText={setOwnerId}
          error={errors.ownerId}
        />

        <ValidatedInput
          label="Group ID"
          required
          placeholder="Misal: GROUP01"
          value={groupId}
          onChangeText={setGroupId}
          error={errors.groupId}
        />

        <ValidatedInput
          label="Nama Outlet"
          required
          placeholder="Contoh: Outlet Depok"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Nomor Telepon"
          required
          keyboardType="phone-pad"
          placeholder="Contoh: 021111"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
        />

        <ValidatedInput
          label="Alamat Outlet"
          required
          placeholder="Jl. Margonda Raya"
          value={address}
          onChangeText={setAddress}
          error={errors.address}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading ? "Menyimpan..." : "Tambah Outlet"}
        </Button>
      </ScrollView>
    </View>
  );
}
