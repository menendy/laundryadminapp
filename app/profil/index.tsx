import React from "react";
import { View } from "react-native";
import { Text, Avatar } from "react-native-paper";

export default function ProfilAkun() {
  return (
    <View style={{ padding: 16, alignItems: "center" }}>
      <Avatar.Text label="AD" size={72} />
      <Text variant="titleLarge" style={{ marginTop: 12 }}>
        Admin Laundry
      </Text>
      <Text variant="bodyMedium">admin@laundryinn.com</Text>
    </View>
  );
}
