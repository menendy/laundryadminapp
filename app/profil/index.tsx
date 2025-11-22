import React from "react";
import { View, Platform } from "react-native";
import { Text, Avatar, Button } from "react-native-paper";
import { useRouter } from "expo-router";

import { auth } from "../../services/firebase-auth";  // ⬅ sama

export default function ProfilAkun() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (!auth) {
        alert("Logout tidak berlaku di Web.");
        return;
      }

      await auth.signOut();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <View style={{ padding: 16, alignItems: "center" }}>
      <Avatar.Text label="AD" size={72} />

      <Text variant="titleLarge" style={{ marginTop: 12 }}>
        Admin Laundry
      </Text>

      <Button mode="contained" onPress={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </Button>
    </View>
  );
}
