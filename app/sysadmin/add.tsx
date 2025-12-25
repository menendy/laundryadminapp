import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { Button, Checkbox } from "react-native-paper";

import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";

import { addSysadmin } from "../../services/api/sysadminService";

import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddSysadminScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");

  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");


  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: any = {};

    if (!nama.trim()) e.nama = "Nama tidak boleh kosong";
    if (!password.trim()) e.password = "Password tidak boleh kosong";
    if (!telp.trim()) e.telp = "Nomor Telepon tidak boleh kosong";
     if (!email.trim()) e.email = "Email tidak boleh kosong";

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

      // PAYLOAD SESUAI FORMAT BACKEND ✔
      const payload = {
        name: nama.trim(),
        alias: alias.trim(),
        phone: telp.trim(),
        email: email.trim(),
        password: password,
        confirm: confirm,
      };

      const result = await addSysadmin(payload);
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Sysadmin berhasil ditambahkan", "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error addSysadmin:", err);
      showSnackbar("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Sysadmin" showBack />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120, // 👈 Tambah jarak aman untuk tombol + navbar
        }}
        keyboardShouldPersistTaps="handled" // 👈 optional biar input tetap fokus
      >
        <ValidatedInput
          label="Nama Lengkap"
          required
          placeholder="Contoh: Ridwan Tamar"
          value={nama}
          onChangeText={setNama}
          error={errors.name}
        />

        <ValidatedInput
          label="Password"
          required
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <ValidatedInput
          label="Konfirmasi Password"
          required
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
        />

        <ValidatedInput
          label="Nama Panggilan"

          placeholder="Contoh: Ridwan"
          value={alias}
          onChangeText={setAlias}
          error={errors.nama}
        />

        <ValidatedInput
          label="Nomor Telepon"
          required
          keyboardType="phone-pad"
          placeholder="812xxxxxxx"
          value={telp}
          onChangeText={(v) => {
            let clean = v.replace(/[^0-9]/g, "");

            if (clean.startsWith("0")) clean = clean.substring(1);

            // Jangan blokir update saat empty
            setTelp(clean);
          }}
          error={errors.telp}
          prefix={<Text style={{ fontSize: 16, color: "#555" }}>+62</Text>}
        />

        <ValidatedInput
          label="Email"
          required
          keyboardType="email-address"
          placeholder="contoh: laundry@gmail.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 25 }}
        >
          {loading ? "Menyimpan..." : "Tambah Sysadmin"}
        </Button>
      </ScrollView>
    </View>
  );
}
