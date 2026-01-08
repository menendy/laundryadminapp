import React, { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function EditPageModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  const [form, setForm] = useState({
    name: params.name || "",
    path: params.path || "",
    component: params.component || "",
  });

  const close = () => router.back();

  const handleSave = () => {
    router.setParams({
  updatedType: "page",
  updatedId: params.id,
  updatedName: form.name,
  updatedPath: form.path,
  updatedComponent: form.component,
});

    close();
  };

  return (
    <Modal isVisible style={{ justifyContent: "flex-end", margin: 0 }}>
      <SafeAreaView style={{ backgroundColor: "#fff", padding: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "700" }}>Edit Page</Text>
          <IconButton icon="close" onPress={close} />
        </View>

        <ValidatedInput
          label="Nama Halaman"
          value={form.name}
          onChangeText={v => setForm(p => ({ ...p, name: v }))}
        />
        <ValidatedInput
          label="Path"
          value={form.path}
          onChangeText={v => setForm(p => ({ ...p, path: v }))}
        />
        <ValidatedInput
          label="Component"
          value={form.component}
          onChangeText={v => setForm(p => ({ ...p, component: v }))}
        />

        <Button mode="contained" onPress={handleSave}>
          Simpan
        </Button>
      </SafeAreaView>
    </Modal>
  );
}
