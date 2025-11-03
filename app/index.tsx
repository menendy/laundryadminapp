import React from "react";
import { ScrollView } from "react-native";
import { Text } from "react-native-paper";
import SafeAreaContainer from "../components/layout/SafeAreaContainer";
import InfoCard from "../components/ui/InfoCard";

export default function Dashboard() {
  return (
    <SafeAreaContainer>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 8 }}>
            Dashboard
        </Text>

        <InfoCard title="Total Transaksi Hari Ini" value="125" />
        <InfoCard title="Karyawan Aktif" value="12" />
        <InfoCard title="Outlet Terdaftar" value="4" />
        </ScrollView>
    </SafeAreaContainer>
  );
}
