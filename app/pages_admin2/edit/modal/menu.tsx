import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function EditMenuModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  // ✅ FIX: Ambil nilai awal dari params (data yang dikirim dari Tree)
  const [name, setName] = useState(params.name || "");

  const [errors, setErrors] = useState<{ name?: string }>({});

  const close = () => router.back();

  const handleSave = () => {
    if (!name.trim()) {
      setErrors({ name: "Nama menu wajib diisi" });
      return;
    }

    // ✅ FIX: Gunakan setParams untuk memicu update di state.ts
    // Jangan gunakan addDraft di sini
    router.setParams({
      updatedType: "menu",
      updatedId: params.id,
      updatedValue: name.trim(),
    });

    close();
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          {/* ✅ FIX: Judul jadi Edit */}
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Edit Menu</Text>
        </View>

        <ValidatedInput
          label="Nama Menu"
          required
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({});
          }}
          error={errors.name}
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
          <Pressable onPress={close} style={{ marginRight: 16, padding: 10 }}>
            <Text>Batal</Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            style={{
              backgroundColor: "#2563eb",
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Simpan</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}