import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function AddPermissionModal() {
  const router = useRouter();
  const { page_id } = useLocalSearchParams<any>();
  const addPermissionDraft = usePagesAdminDraftStore(s => s.addPermissionDraft);

  const [permission, setPermission] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (!permission || !url) return;

    addPermissionDraft(page_id, { permission, url });
    router.back();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Card style={{ padding: 20, borderRadius: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
          Tambah Permission
        </Text>

        <ValidatedInput
          label="Permission"
          required
          value={permission}
          onChangeText={setPermission}
        />

        <ValidatedInput
          label="URL"
          required
          value={url}
          onChangeText={setUrl}
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Text>Batal</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            style={{ backgroundColor: "#2563eb", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff" }}>Tambah</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}
