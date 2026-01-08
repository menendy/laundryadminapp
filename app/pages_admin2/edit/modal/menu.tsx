import React, { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function EditMenuModal() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<any>();
  const [value, setValue] = useState(name || "");

  const close = () => router.back();

  const handleSave = () => {
    router.setParams({
      updatedType: "menu",
      updatedId: id,
      updatedValue: value.trim(),
    });
    close();
  };

  return (
    <Modal isVisible style={{ justifyContent: "flex-end", margin: 0 }}>
      <SafeAreaView style={{ backgroundColor: "#fff", padding: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "700" }}>Edit Menu</Text>
          <IconButton icon="close" onPress={close} />
        </View>

        <ValidatedInput
          label="Nama Menu"
          value={value}
          onChangeText={setValue}
        />

        <Button mode="contained" onPress={handleSave}>
          Simpan
        </Button>
      </SafeAreaView>
    </Modal>
  );
}
