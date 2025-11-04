import React from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, DataTable } from "react-native-paper";
import { useRouter } from "expo-router";
import SafeAreaContainer from "../../components/layout/SafeAreaContainer";
import { useKaryawanStore } from "../../store/useKaryawanStore";
import AppContainer from "../../components/layout/AppContainer";

export default function KaryawanList() {
  const router = useRouter();
  const { karyawan, removeKaryawan } = useKaryawanStore();
 // testing commit
  return (
   
        <AppContainer title="Data Karyawan">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Button
            mode="contained"
            onPress={() => router.push("/karyawan/add")}
            style={{ marginBottom: 16 }}
            >
            + Tambah Karyawan
            </Button>
            
            <DataTable>
            <DataTable.Header>
                <DataTable.Title>Nama</DataTable.Title>
                <DataTable.Title>Posisi</DataTable.Title>
                <DataTable.Title>Telepon</DataTable.Title>
                <DataTable.Title numeric>Aksi</DataTable.Title>
            </DataTable.Header>

            {karyawan.map((k) => (
                <DataTable.Row key={k.id}>
                <DataTable.Cell>{k.nama}</DataTable.Cell>
                <DataTable.Cell>{k.posisi}</DataTable.Cell>
                <DataTable.Cell>{k.telp}</DataTable.Cell>
                <DataTable.Cell numeric>
                    <Button
                    compact
                    onPress={() => router.push(`/karyawan/${k.id}`)}
                    >
                    Edit
                    </Button>
                    <Button compact textColor="red" onPress={() => removeKaryawan(k.id)}>
                    Hapus
                    </Button>
                </DataTable.Cell>
                </DataTable.Row>
            ))}
            </DataTable>
        </ScrollView>
        </AppContainer>
   
  );
}
