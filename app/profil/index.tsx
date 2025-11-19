import React from "react";
import { View } from "react-native";
import { Text, Avatar, Button } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "expo-router";

export default function ProfilAkun() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <View style={{ padding: 16, alignItems: "center" }}>
      <Avatar.Text label="AD" size={72} />

      <Text variant="titleLarge" style={{ marginTop: 12 }}>
        Admin Laundry
      </Text>

      <Text variant="bodyMedium">admin@laundryinn.com</Text>

      <Button
        mode="contained"
        style={{ marginTop: 20 }}
        onPress={handleLogout}
      >
        Logout
      </Button>
    </View>
  );
}
