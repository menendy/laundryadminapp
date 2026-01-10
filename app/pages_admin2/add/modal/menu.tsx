import React, { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function AddMenuModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  
  const addDraft = usePagesAdminDraftStore((s) => s.addDraft);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("folder");
  const [path, setPath] = useState("");

  const [errors, setErrors] = useState<{ name?: string; }>({});

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
      // ✅ SIMPAN ICON
      icon: icon.trim() || "folder",
      path: path.trim() || "",
      parent_id: parentId,
      sort: incomingSort,
      level: 0,
      is_expandable: true,
      active: true,
      can_view_by: [],
      permissions_type: {},
      children: []
    } as any);

    router.back();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
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

        {/* ✅ PERBAIKAN ALIGNMENT: Rata Tengah */}
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
                marginBottom: 12 // Sejajar dengan input field saja
            }}>
                <MaterialCommunityIcons 
                    name={icon as any} 
                    size={28} 
                    color="#334155" 
                />
            </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10, alignItems: "center" }}>
          <Pressable 
            onPress={() => router.back()}
            style={{ marginRight: 16, padding: 10 }}
          >
            <Text style={{ color: "#000" }}>Batal</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            style={{ backgroundColor: "#2563eb", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Tambah</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}