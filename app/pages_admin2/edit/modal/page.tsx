import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

export default function EditPageModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  // Inisialisasi state dengan data dari params
  const [form, setForm] = useState({
    name: params.name || "",
    path: params.path || "",
    component: params.component || "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<{ name?: string; path?: string; component?: string }>({});

  const close = () => router.back();

  const handleSave = () => {
    let isValid = true;
    const newErrors: { name?: string; path?: string; component?: string } = {};

    // Validasi Nama
    if (!form.name.trim()) {
      newErrors.name = "Nama halaman wajib diisi";
      isValid = false;
    }

    // Validasi Path
    if (!form.path.trim()) {
      newErrors.path = "Path wajib diisi";
      isValid = false;
    }

     if (!form.component.trim()) {
      newErrors.component = "Component wajib diisi";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // Kirim sinyal update ke parent via params
    router.setParams({
      updatedType: "page",
      updatedId: params.id,
      updatedName: form.name,
      updatedPath: form.path,
      updatedComponent: form.component,
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
        {/* Header Style sesuai Benchmark */}
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
          required
          value={form.component}
         onChangeText={(v) => {
            setForm((p) => ({ ...p, component: v }));
            if (errors.component) setErrors((p) => ({ ...p, component: undefined }));
          }}
          error={errors.component}
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