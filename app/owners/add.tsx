import React, { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addOwner } from "../../services/api/ownersService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";
import { useBasePath } from "../../utils/useBasePath";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddOwnerScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();

  const insets = useSafeAreaInsets();

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [outletName, setOutletName] = useState("");
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
        outlet_name: outletName,
        password,
        confirm,
        rootPath,
        basePath,
      });

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar(result.message ?? "berhasil ditambahkan", "success");
      //router.back();
    } catch (err) {

      console.error("🔥 Error addOutlet:", err);
      // 🔥 Pakai handler yang sama untuk NETWORK / AXIOS error
      handleBackendError(err, setErrors, showSnackbar);

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

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 + insets.bottom, }}>
        <ValidatedInput
          label="Nama Owner"
          required
          placeholder="Contoh: PT Harmonia Laundry"
          value={name}
          onChangeText={setName}
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
          label="Nomor Telepon"
          required
          keyboardType="phone-pad"
          placeholder="812xxxxxxx"
          value={phone}
          onChangeText={(v) => {
            let clean = v.replace(/[^0-9]/g, "");

            if (clean.startsWith("0")) clean = clean.substring(1);

            // Jangan blokir update saat empty
            setPhone(clean);
          }}
          error={errors.phone}
          prefix={<Text style={{ fontSize: 16, color: "#555" }}>+62</Text>}
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
          label="Nama Outlet"
          required
          placeholder="Contoh: Outlet Depok"
          value={outletName}
          onChangeText={setOutletName}
          error={errors.outletName}
        />

        <ValidatedInput
          label="Alamat Outlet"
          required
          placeholder="Contoh Jl. Margonda Raya..."
          value={address}
          onChangeText={setAddress}
          error={errors.address}
          multiline
          numberOfLines={3}  // bisa disesuaikan
          style={{ minHeight: 100, textAlignVertical: "top" }} // supaya teks mulai dari atas
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
