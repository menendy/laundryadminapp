import React from "react";
import { ScrollView, View, useWindowDimensions, Platform } from "react-native";
import { Drawer, Text, IconButton, Divider, Badge } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";

export default function DrawerMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web";
  const isNarrowScreen = width < 768;

  const menuItems = [
    { label: "Dashboard", icon: "view-dashboard", path: "/" },
    { label: "Profil Akun", icon: "account-circle", path: "/profil" },
    { label: "Karyawan", icon: "account-group", path: "/karyawan" },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          padding: 16,
          backgroundColor: "#e6eeff",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="titleMedium" style={{ fontWeight: "600" }}>
          Menu
        </Text>
        <IconButton icon="close" onPress={onClose} />
      </View>

      <Drawer.Section>
        {menuItems.map((item) => (
          <Drawer.Item
            key={item.path}
            label={item.label}
            icon={item.icon}
            active={pathname === item.path}
            onPress={() => {
              router.push(item.path);

              // ✅ Hanya auto-close di mobile / web sempit
              if (!isWeb || isNarrowScreen) {
                onClose();
              }
            }}
          />
        ))}
      </Drawer.Section>

      <Divider />

      <Drawer.Section title="Fitur Baru">
        <Drawer.Item
          label="Fitur Khusus"
          icon="star"
          right={() => <Badge style={{ backgroundColor: "#5b8df9" }}>Baru</Badge>}
        />
        <Drawer.Item
          label="QRIS"
          icon="qrcode"
          right={() => <Badge style={{ backgroundColor: "#5b8df9" }}>Baru</Badge>}
        />
        <Drawer.Item
          label="Pengaturan Umum"
          icon="cog"
          right={() => <Badge style={{ backgroundColor: "#5b8df9" }}>Baru</Badge>}
        />
      </Drawer.Section>
    </ScrollView>
  );
}
