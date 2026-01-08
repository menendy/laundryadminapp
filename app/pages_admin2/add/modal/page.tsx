import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useRouter } from "expo-router";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";

export default function AddPageModal() {
  const router = useRouter();
  const addDraft = usePagesAdminDraftStore((s) => s.addDraft);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !path.trim()) return;

    addDraft({
      id: "TMP_PAGE_" + Date.now(),
      type: "page",
      name: name.trim(),
      path: path.trim(),
      component: component.trim() || null,
      parent_id: null,
      sort: 9999,
      level: 0,
    } as any);

    // ⬅️ PENTING: back biasa
    router.back();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
    >
      <Card style={{ padding: 20, borderRadius: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
          Tambah Halaman
        </Text>

        <Text>Nama Halaman</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Data User"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
          }}
        />

        <Text>Path</Text>
        <TextInput
          value={path}
          onChangeText={setPath}
          placeholder="/users"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
          }}
        />

        <Text>Component (opsional)</Text>
        <TextInput
          value={component}
          onChangeText={setComponent}
          placeholder="UsersPage"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 10,
            marginBottom: 20,
          }}
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Text>Batal</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            style={{
              backgroundColor: "#2563eb",
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Tambah
            </Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}
