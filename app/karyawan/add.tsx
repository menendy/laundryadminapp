import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { addMitra } from "../../services/api/mitraService";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddMitraScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nama?: string; telp?: string; alamat?: string }>({});

  const validate = () => {
    const newErrors: any = {};
    if (!nama.trim()) newErrors.nama = "Nama Mitra tidak boleh kosong";
    if (!telp.trim()) newErrors.telp = "Nomor Telepon tidak boleh kosong";
    if (!alamat.trim()) newErrors.alamat = "Alamat tidak boleh kosong";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  // Reset error sebelum submit
  setErrors({});

  // Kalau validasi local gagal, stop
  if (!validate()) {
    showSnackbar("Lengkapi semua data dengan benar", "error");
    return;
  }

  try {
    setLoading(true);

    const result = await addMitra({ nama, telp, alamat });

    const ok = handleBackendError(result, setErrors, showSnackbar);

    if (!ok) {
      // ❗ KUNCI UTAMA: JANGAN return sebelum React render error-nya
      return;
    }

    showSnackbar(`✅ ${result.message}`, "success");
    router.back();
  } catch (err) {
    console.error("🔥 Error add mitra:", err);
    showSnackbar("Terjadi kesalahan koneksi", "error");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* ✅ Header dengan tombol back dan simpan */}
      <AppHeaderActions
        title="Tambah Mitra"
        showBack={true}
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Nama Mitra"
          required
          placeholder="Contoh: Harmania Laundry"
          value={nama}
          onChangeText={setNama}
          error={errors.nama}
        />
        <ValidatedInput
          label="Nomor Telepon"
          required
          keyboardType="phone-pad"
          placeholder="Contoh: 08123456789"
          value={telp}
          onChangeText={setTelp}
          error={errors.telp}
        />
        <ValidatedInput
          label="Alamat"
          required
          placeholder="Contoh: Jl. Fatmawati No. 45, Jakarta Selatan"
          value={alamat}
          onChangeText={setAlamat}
          error={errors.alamat}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading ? "Menyimpan..." : "Tambah Mitra"}
        </Button>
      </ScrollView>
    </View>
  );
}
