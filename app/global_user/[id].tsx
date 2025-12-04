import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useKaryawanStore } from "../../store/useKaryawanStore";
import AppContainer from "../../components/layout/AppContainer";

export default function EditKaryawan() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { karyawan, updateKaryawan } = useKaryawanStore();
  const data = karyawan.find((k) => k.id === id);

  const [nama, setNama] = useState(data?.nama ?? "");
  const [posisi, setPosisi] = useState(data?.posisi ?? "");
  const [telp, setTelp] = useState(data?.telp ?? "");

  const handleSave = () => {
    updateKaryawan({ id: id as string, nama, posisi, telp });
    router.replace("/karyawan");
  };

  return (
    <AppContainer title="Edit Karyawan">
      <View style={{ padding: 16 }}>
        <TextInput label="Nama" value={nama} onChangeText={setNama} style={{ marginBottom: 8 }} />
        <TextInput label="Posisi" value={posisi} onChangeText={setPosisi} style={{ marginBottom: 8 }} />
        <TextInput label="Telepon" value={telp} onChangeText={setTelp} style={{ marginBottom: 16 }} />
        <Button mode="contained" onPress={handleSave}>Simpan Perubahan</Button>
      </View>
    </AppContainer>
  );
}
