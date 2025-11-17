import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { registerOwner } from "../../services/api/authService";

export default function RegisterOwnerScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Nama wajib diisi";
    if (!phone.trim()) e.phone = "No HP wajib diisi";

    if (!email.trim()) e.email = "Email wajib diisi";
    else if (!email.includes("@")) e.email = "Format email tidak valid";

    if (!password) e.password = "Password wajib diisi";
    else if (password.length < 6)
      e.password = "Minimal 6 karakter";

    if (password !== confirm)
      e.confirm = "Password tidak sama";

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Periksa kembali form Anda", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = { name, phone, email, password };

      const res = await registerOwner(payload);

      if (!res.success) {
        showSnackbar(res.message || "Gagal register owner", "error");
        return;
      }

      showSnackbar("Registrasi berhasil. Menunggu aktivasi admin.", "success");

      //router.replace("/auth/login");
    } catch (err) {
      console.error("🔥 registerOwner:", err);
      showSnackbar("Terjadi kesalahan server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Registrasi Owner" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <ValidatedInput
          label="Nama Lengkap"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Nomor HP"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
        />

        <ValidatedInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <ValidatedInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <ValidatedInput
          label="Konfirmasi Password"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 30 }}
        >
          Daftar Owner
        </Button>
      </ScrollView>
    </View>
  );
}
