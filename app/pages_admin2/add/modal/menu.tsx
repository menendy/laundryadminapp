import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";

import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function AddMenuModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  
  const addDraft = usePagesAdminDraftStore((s) => s.addDraft);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // ✅ TERIMA SORT YANG SUDAH DIHITUNG DARI PARENT
  const incomingSort = params.sort ? Number(params.sort) : 9999;
  const parentId = params.parent_id || null;

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrors({ name: "Nama menu wajib diisi" });
      return;
    }

    addDraft({
      id: "TMP_MENU_" + Date.now(),
      type: "menu",
      name: name.trim(),
      path: path.trim() || null,
      parent_id: parentId,
      sort: incomingSort, // ✅ GUNAKAN SORT DARI PARAMS
      level: 0,
    } as any);

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
      <Card style={{ padding: 20, borderRadius: 16, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
          Tambah Menu
        </Text>

        <ValidatedInput
          label="Nama Menu"
          required
          placeholder="Contoh: Pengaturan"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({});
          }}
          error={errors.name}
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