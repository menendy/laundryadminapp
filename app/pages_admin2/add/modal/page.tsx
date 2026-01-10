import React, { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Import Icon
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function AddPageModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  
  const addDraft = usePagesAdminDraftStore((s) => s.addDraft);

  const [name, setName] = useState("");
  // ✅ State Icon (Default 'file-document-outline' agar sesuai konteks page)
  const [icon, setIcon] = useState("file-document-outline"); 
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    path?: string;
    component?: string;
  }>({});

  const incomingSort = params.sort ? Number(params.sort) : 9999;
  const parentId = params.parent_id || null;

  const handleSubmit = () => {
    const newErrors: { name?: string; path?: string; component?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Nama halaman wajib diisi";
      isValid = false;
    }
    
    if (!path.trim()) {
      newErrors.path = "Path wajib diisi";
      isValid = false;
    }

    if (!component.trim()) {
      newErrors.component = "Component wajib diisi";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    addDraft({
      id: "TMP_PAGE_" + Date.now(),
      type: "page",
      name: name.trim(),
      // ✅ Simpan Icon
      icon: icon.trim() || "file-document-outline",
      path: path.trim(),
      component: component.trim() || "",
      parent_id: parentId,
      sort: incomingSort,
      level: 0,
      is_expandable: false,
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
          Tambah Halaman
        </Text>

        <ValidatedInput
          label="Nama Halaman"
          required
          placeholder="Contoh: Data User"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
        />

        {/* ✅ INPUT ICON + PREVIEW */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
                <ValidatedInput
                    label="Icon (MaterialCommunityIcons)"
                    placeholder="Contoh: file-table, view-list"
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

        <ValidatedInput
          label="Path"
          required
          placeholder="Contoh: /users"
          value={path}
          onChangeText={(text) => {
            setPath(text);
            if (errors.path) setErrors((prev) => ({ ...prev, path: undefined }));
          }}
          error={errors.path}
        />

        <ValidatedInput
          label="Component"
          required
          placeholder="Contoh: Data User"
          value={component}
           onChangeText={(text) => {
            setComponent(text);
            if (errors.component) setErrors((prev) => ({ ...prev, component: undefined }));
          }}
          error={errors.component}
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10, alignItems: "center" }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 10 }}>
            <Text>Batal</Text>
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