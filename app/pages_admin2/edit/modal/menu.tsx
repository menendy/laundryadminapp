import React, { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Import Icon
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";

export default function EditMenuModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  
  const setUpdateSignal = usePagesAdminDraftStore((s) => s.setUpdateSignal);

  const [name, setName] = useState(params.name || "");
  // ✅ Ambil icon dari params, default ke "folder" jika kosong
  const [icon, setIcon] = useState(params.icon || "folder"); 
  
  const [errors, setErrors] = useState<{ name?: string }>({});

  const close = () => router.back();

  const handleSave = () => {
    if (!name.trim()) {
      setErrors({ name: "Nama menu wajib diisi" });
      return;
    }

    setUpdateSignal({
      updatedType: "menu",
      updatedId: params.id,
      updatedValue: name.trim(),
      // ✅ Kirim icon yang baru
      updatedIcon: icon.trim(), 
    });

    close();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Card style={{ padding: 20, borderRadius: 16, backgroundColor: "#fff" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
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

        {/* ✅ UI INPUT ICON + PREVIEW (Sama seperti Add Modal) */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
                <ValidatedInput
                    label="Icon (MaterialCommunityIcons)"
                    placeholder="Contoh: account-group, cog"
                    value={icon}
                    onChangeText={setIcon}
                />
                <Pressable onPress={() => Linking.openURL('https://icons.expo.fyi/Index')}>
                    <Text style={{ fontSize: 12, color: '#2563eb', marginTop: -8, marginBottom: 12 }}>
                        Cari nama icon di sini
                    </Text>
                </Pressable>
            </View>

            {/* Preview Box */}
            <View style={{ 
                width: 50, 
                height: 50, 
                backgroundColor: "#f1f5f9", 
                borderRadius: 8, 
                justifyContent: "center", 
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                marginBottom: 12 
            }}>
                <MaterialCommunityIcons 
                    name={icon as any} 
                    size={28} 
                    color="#334155" 
                />
            </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10, alignItems: "center" }}>
          <Pressable onPress={close} style={{ marginRight: 16, padding: 10 }}>
            <Text style={{ color: "#000" }}>Batal</Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            style={{ backgroundColor: "#2563eb", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Simpan</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}