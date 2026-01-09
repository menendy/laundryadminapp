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

  // 1. Tambahkan state untuk menampung error
  const [errors, setErrors] = useState<{ permission?: string; url?: string }>({});

  const close = () => router.back();

  const handleSave = () => {
    // 2. Logika Validasi
    let isValid = true;
    const newErrors: { permission?: string; url?: string } = {};

    if (!permission.trim()) {
      newErrors.permission = "Permission wajib diisi";
      isValid = false;
    }

    if (!url.trim()) {
      newErrors.url = "URL wajib diisi";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // Jika valid, lanjutkan simpan params
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
          required
          value={permission}
          onChangeText={(text) => {
            setPermission(text);
            // Hapus error saat user mengetik
            if (errors.permission) setErrors((prev) => ({ ...prev, permission: undefined }));
          }}
          error={errors.permission}
        />

        <ValidatedInput
          label="URL"
          required
          value={url}
          onChangeText={(text) => {
            setUrl(text);
            // Hapus error saat user mengetik
            if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
          }}
          error={errors.url}
        />

        <Button mode="contained" onPress={handleSave}>
          Simpan
        </Button>
      </SafeAreaView>
    </Modal>
  );
}