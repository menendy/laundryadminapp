import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useKaryawanStore } from "../../store/useKaryawanStore";
import AppContainer from "../../components/layout/AppContainer";

export default function AddKaryawan() {
  const router = useRouter();
  const { addKaryawan } = useKaryawanStore();
  const [nama, setNama] = useState("");
  const [posisi, setPosisi] = useState("");
  const [telp, setTelp] = useState("");

  const handleSave = () => {
    addKaryawan({ nama, posisi, telp });
    router.replace("/karyawan");
  };

  return (
    <AppContainer title="Tambah Karyawan">
      <View style={{ padding: 16 }}>
        <TextInput label="Nama" value={nama} onChangeText={setNama} style={{ marginBottom: 8 }} />
        <TextInput label="Posisi" value={posisi} onChangeText={setPosisi} style={{ marginBottom: 8 }} />
        <TextInput label="Telepon" value={telp} onChangeText={setTelp} style={{ marginBottom: 16 }} />
        <Button mode="contained" onPress={handleSave}>Simpan</Button>
      </View>
    </AppContainer>
  );
}
