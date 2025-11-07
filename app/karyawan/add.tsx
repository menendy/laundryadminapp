import React, { useState } from "react";
import { View, Button, ScrollView } from "react-native";
import { addMitra } from "../../services/api/mitraService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import HeaderBar from "../../components/ui/HeaderBar";
import ValidatedInput from "../../components/ui/ValidatedInput";

export default function AddMitraScreen() {
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [errors, setErrors] = useState<{ nama?: string; telp?: string; alamat?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!nama.trim()) newErrors.nama = "Nama Mitra tidak boleh kosong";
    if (!telp.trim()) newErrors.telp = "Nomor Telepon tidak boleh kosong";
    if (!alamat.trim()) newErrors.alamat = "Alamat tidak boleh kosong";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

       const handleSubmit = async () => {
  if (!validate()) {
    showSnackbar("Lengkapi semua data dengan benar", "error");
    return;
  }

  try {
    setLoading(true);
    const result = await addMitra({ nama, telp, alamat });

    // ⚙️ Handle error structured dari backend
    if (result.status >= 400 && result.field) {
      setErrors({ [result.field]: result.message });
      showSnackbar(`❌ ${result.message}`, "error");
      return;
    }

    if (result.status >= 400 && !result.field) {
      // error umum
      showSnackbar(`❌ ${result.message}`, "error");
      return;
    }

    // ✅ Berhasil
    showSnackbar(`✅ ${result.message}`, "success");
    setNama("");
    setTelp("");
    setAlamat("");
    setErrors({});
  } catch (err: any) {
    console.error("🔥 Gagal add mitra:", err);
    showSnackbar("Terjadi kesalahan koneksi", "error");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <HeaderBar title="Tambah Mitra" showBackButton />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Nama Mitra"
          required
          placeholder="Contoh: Harmania Laundry"
          value={nama}
          onChangeText={(text) => {
            setNama(text);
            if (errors.nama) setErrors({ ...errors, nama: undefined });
          }}
          error={errors.nama}
        />

        <ValidatedInput
          label="Nomor Telepon"
          required
          keyboardType="phone-pad"
          placeholder="Contoh: 08123456789"
          value={telp}
          onChangeText={(text) => {
            setTelp(text);
            if (errors.telp) setErrors({ ...errors, telp: undefined });
          }}
          error={errors.telp}
        />

        <ValidatedInput
          label="Alamat"
          required
          placeholder="Contoh: Jl. Fatmawati No. 45, Jakarta Selatan"
          value={alamat}
          onChangeText={(text) => {
            setAlamat(text);
            if (errors.alamat) setErrors({ ...errors, alamat: undefined });
          }}
          error={errors.alamat}
        />

        <Button
          title={loading ? "Menyimpan..." : "Tambah Mitra"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </ScrollView>
    </View>
  );
}
