import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function AddPageModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  const addDraft = usePagesAdminDraftStore((s) => s.addDraft);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");

  // Tambahkan state error agar visual validasi merah muncul (seperti di menu.tsx)
  const [errors, setErrors] = useState<{
    name?: string;
    path?: string;
    component?: string;
  }>({});

  // ✅ TERIMA SORT YANG SUDAH DIHITUNG DARI PARENT
  const incomingSort = params.sort ? Number(params.sort) : 9999;
  const parentId = params.parent_id || null;

  const handleSubmit = () => {
    // Reset error logic
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
      path: path.trim(),
      component: component.trim() || null,
      parent_id: parentId,
      sort: incomingSort, // ✅ GUNAKAN SORT DARI PARAMS
      level: 0,
      // Default props untuk menghindari error TS di kemudian hari
      is_expandable: false,
      active: true,
      can_view_by: [],
      permissions_type: {}
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
          Tambah Halaman
        </Text>

        {/* INPUT 1: NAMA HALAMAN */}
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

        {/* INPUT 2: PATH */}
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

        {/* INPUT 3: COMPONENT (Optional) */}
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