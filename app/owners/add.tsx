import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addOwner } from "../../services/api/ownersService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddOwnerScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // =============================================================
  // VALIDASI SIMPLE
  // =============================================================
  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Nama owner wajib diisi";
    if (!phone.trim()) e.phone = "Nomor telepon wajib diisi";
    if (!email.trim()) e.email = "Email wajib diisi";
    if (!address.trim()) e.address = "Alamat wajib diisi";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // =============================================================
  // SUBMIT
  // =============================================================
  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      const result = await addOwner({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar(result.message ?? "Owner berhasil ditambahkan", "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error addOwner:", err);
      showSnackbar("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  // =============================================================
  // RENDER
  // =============================================================
  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Owner" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Nama Owner"
          required
          placeholder="Contoh: PT Harmonia Laundry"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Nomor Telepon"
          required
          keyboardType="phone-pad"
          placeholder="08123456789"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
        />

        <ValidatedInput
          label="Email"
          required
          keyboardType="email-address"
          placeholder="owner@domain.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        <ValidatedInput
          label="Alamat"
          required
          placeholder="Alamat lengkap"
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
          {loading ? "Menyimpan..." : "Tambah Owner"}
        </Button>
      </ScrollView>
    </View>
  );
}
