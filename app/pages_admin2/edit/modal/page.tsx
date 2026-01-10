import React, { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Import Icon
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";

export default function EditPageModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  const setUpdateSignal = usePagesAdminDraftStore((s) => s.setUpdateSignal);

  const [form, setForm] = useState({
    name: params.name || "",
    // ✅ Ambil icon dari params
    icon: params.icon || "file-document-outline",
    path: params.path || "",
    component: params.component || "",
  });

  const [errors, setErrors] = useState<{ name?: string; path?: string }>({});

  const close = () => router.back();

  const handleSave = () => {
    let isValid = true;
    const newErrors: { name?: string; path?: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Nama halaman wajib diisi";
      isValid = false;
    }
    if (!form.path.trim()) {
      newErrors.path = "Path wajib diisi";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // ✅ KIRIM SIGNAL KE STORE (Termasuk Icon)
    setUpdateSignal({
      updatedType: "page",
      updatedId: params.id,
      updatedName: form.name,
      updatedIcon: form.icon, // Kirim icon baru
      updatedPath: form.path,
      updatedComponent: form.component,
    });

    close();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Card style={{ padding: 20, borderRadius: 16, backgroundColor: "#fff" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Edit Halaman</Text>
        </View>

        <ValidatedInput
          label="Nama Halaman"
          required
          value={form.name}
          onChangeText={(v) => {
            setForm((p) => ({ ...p, name: v }));
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          error={errors.name}
        />

        {/* ✅ INPUT ICON + PREVIEW */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
                <ValidatedInput
                    label="Icon (MaterialCommunityIcons)"
                    placeholder="Contoh: file-table"
                    value={form.icon}
                    onChangeText={(v) => setForm((p) => ({ ...p, icon: v }))}
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
                    name={form.icon as any} 
                    size={28} 
                    color="#334155" 
                />
            </View>
        </View>

        <ValidatedInput
          label="Path"
          required
          value={form.path}
          onChangeText={(v) => {
            setForm((p) => ({ ...p, path: v }));
            if (errors.path) setErrors((p) => ({ ...p, path: undefined }));
          }}
          error={errors.path}
        />

        <ValidatedInput
          label="Component"
          value={form.component}
          onChangeText={(v) => setForm((p) => ({ ...p, component: v }))}
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10, alignItems: "center" }}>
          <Pressable onPress={close} style={{ marginRight: 16, padding: 10 }}>
            <Text>Batal</Text>
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