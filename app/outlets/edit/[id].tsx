import React, { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import ValidatedInput from "../../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { useBasePath } from "../../../utils/useBasePath";
import { handleBackendError } from "../../../utils/handleBackendError";

import { getOutletById, updateOutlet } from "../../../services/api/outletsService";

export default function EditOutletScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // /edit?id=xxxx

  const { rootBase: rootPath, basePath } = useBasePath();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [errors, setErrors] = useState<any>({});
  
  // Load data awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getOutletById(id as string,rootPath,basePath);
        console.log("Outlet detail:", result);

        setName(result.name || "");
        setPhone((result.phone || "").replace(/^(\+62|62)/, "")); // hilangkan prefix dulu
        setAddress(result.address || "");
      } catch (err) {
        console.error("❌ Error getOutletById:", err);
        showSnackbar("Gagal memuat data outlet", "error");
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchData();
  }, [id]);

  const validate = () => {
    const e: any = {};
    if (!name.trim()) e.name = "Nama Outlet wajib diisi";
    if (!phone.trim()) e.phone = "Nomor telepon wajib diisi";
    if (!address.trim()) e.address = "Alamat wajib diisi";

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

      const payload = {
        id, name, address, phone, rootPath, basePath,
      };


      const result = await updateOutlet( String(id), payload );

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("berhasil diperbarui", "success");
      router.back(); // karena edit → balik ke list/detail

    } catch (err) {
      console.error("🔥 Error updateOutlet:", err);
      handleBackendError(err, setErrors, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  if (loadingFetch) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Edit Outlet" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <ValidatedInput
          label="Nama Outlet"
          required
          value={name}
          onChangeText={setName}
          error={errors.name}
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
          label="Alamat Outlet"
          required
          value={address}
          onChangeText={setAddress}
          error={errors.address}
          multiline
          numberOfLines={3}
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </ScrollView>
    </View>
  );
}
