import React, { useState } from "react";
import { View, Text, TextInput, Button, Platform } from "react-native";
import { addMitra } from "../../services/api/mitraService";
import { useSnackbarStore } from "../../store/useSnackbarStore";

export default function AddMitraScreen() {
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nama || !telp || !alamat) {
      showSnackbar("Lengkapi semua data", "error");
      return;
    }

    try {
      setLoading(true);
      const result = await addMitra({ nama, telp, alamat });
      showSnackbar(`✅ Berhasil menambahkan Mitra: ${result.id}`, "success");
      setNama("");
      setTelp("");
      setAlamat("");
    } catch (err) {
      console.error(err);
      showSnackbar("❌ Gagal menambahkan mitra", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* 🔹 Header Title */}
      <View
        style={{
          paddingTop: Platform.OS === "android" ? 40 : 60, // jarak aman dari status bar
          paddingBottom: 16,
          backgroundColor: "#1976D2",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "white",
            letterSpacing: 0.5,
          }}
        >
          Tambah Mitra
        </Text>
      </View>

      {/* 🔹 Form Input */}
      <View style={{ padding: 20 }}>
        <TextInput
          placeholder="Nama Mitra"
          value={nama}
          onChangeText={setNama}
          style={{
            borderBottomWidth: 1,
            borderColor: "#ccc",
            marginBottom: 10,
            paddingVertical: 6,
          }}
        />
        <TextInput
          placeholder="Nomor Telepon"
          value={telp}
          onChangeText={setTelp}
          style={{
            borderBottomWidth: 1,
            borderColor: "#ccc",
            marginBottom: 10,
            paddingVertical: 6,
          }}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Alamat"
          value={alamat}
          onChangeText={setAlamat}
          style={{
            borderBottomWidth: 1,
            borderColor: "#ccc",
            marginBottom: 20,
            paddingVertical: 6,
          }}
        />
        <Button
          title={loading ? "Menyimpan..." : "Tambah Mitra"}
          onPress={handleSubmit}
          disabled={loading}
          color={Platform.OS === "ios" ? "#1976D2" : undefined}
        />
      </View>
    </View>
  );
}
