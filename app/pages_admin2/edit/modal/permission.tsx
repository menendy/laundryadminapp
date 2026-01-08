import React, { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function EditPermissionModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  const [permission, setPermission] = useState(params.permission || "");
  const [url, setUrl] = useState(params.url || "");

  const close = () => router.back();

  const handleSave = () => {
    router.setParams({
      updatedType: "permission",
      updatedId: params.id,
      oldUrl: params.oldUrl,
      updatedPermission: permission,
      updatedUrl: url,
    });
    close();
  };

  return (
    <Modal isVisible style={{ justifyContent: "flex-end", margin: 0 }}>
      <SafeAreaView style={{ backgroundColor: "#fff", padding: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "700" }}>Edit Permission</Text>
          <IconButton icon="close" onPress={close} />
        </View>

        <ValidatedInput
          label="Permission"
          value={permission}
          onChangeText={setPermission}
        />
        <ValidatedInput
          label="URL"
          value={url}
          onChangeText={setUrl}
        />

        <Button mode="contained" onPress={handleSave}>
          Simpan
        </Button>
      </SafeAreaView>
    </Modal>
  );
}
