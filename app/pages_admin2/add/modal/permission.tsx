import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function AddPermissionModal() {
  const router = useRouter();
  const { page_id } = useLocalSearchParams<any>();
  
  // ✅ GANTI addPermissionDraft dengan setUpdateSignal
  // Mekanisme ini jauh lebih stabil untuk data server maupun draft
  const setUpdateSignal = usePagesAdminDraftStore(s => s.setUpdateSignal);

  const [permission, setPermission] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<{ permission?: string; url?: string }>({});

  const handleSubmit = () => {
    // Validasi sederhana
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

    // ✅ KIRIM SINYAL KE STATE.TS
    setUpdateSignal({
      updatedType: "permission",
      updatedId: page_id,
      oldUrl: null, // Null karena ini penambahan baru, bukan edit URL lama
      updatedPermission: permission.trim(),
      updatedUrl: url.trim(),
    });

    router.back();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Card style={{ padding: 20, borderRadius: 16, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
          Tambah Permission
        </Text>

        <ValidatedInput
          label="Permission"
          required
          placeholder="Contoh: hapus"
          value={permission}
          onChangeText={(text) => {
            setPermission(text);
            if (errors.permission) setErrors(prev => ({ ...prev, permission: undefined }));
          }}
          error={errors.permission}
        />

        <ValidatedInput
          label="URL"
          required
          placeholder="Contoh: /users/delete"
          value={url}
          onChangeText={(text) => {
            setUrl(text);
            if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
          }}
          error={errors.url}
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 10 }}>
            <Text>Batal</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            style={{ 
              backgroundColor: "#2563eb", 
              paddingHorizontal: 18, 
              paddingVertical: 10, 
              borderRadius: 8 
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Tambah</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}