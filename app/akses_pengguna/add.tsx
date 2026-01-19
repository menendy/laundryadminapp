import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import { Button, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// 👇 1. Import Library Keyboard Aware
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addAksesPengguna } from "../../services/api/aksesPenggunaService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";
import { useRolePermissionStore } from "../../store/useRolePermissionStore";
import { useBasePath } from "../../utils/useBasePath";

export default function AddAksesPenggunaScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const resetPermissions = useRolePermissionStore((s) => s.resetPermissions);

  // 👇 2. Setup Refs untuk Scroll dan Koordinat
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const fieldYCoords = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    resetPermissions(); // 🔥 Mulai fresh di mode ADD
  }, []);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [appAccess, setAppAccess] = useState<string[]>([]);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 👇 3. Urutan Field UI (Untuk prioritas scroll)
  const fieldOrder = ["name", "desc", "access"];

  // Helper: Simpan koordinat Y input
  const handleLayout = (fieldName: string) => (event: LayoutChangeEvent) => {
    fieldYCoords.current[fieldName] = event.nativeEvent.layout.y;
  };

  // Helper: Scroll ke error pertama
  const scrollToFirstError = (errorFields: string[]) => {
    const firstErrorField = fieldOrder.find(field => errorFields.includes(field));
    if (firstErrorField) {
      const yPosition = fieldYCoords.current[firstErrorField];
      if (yPosition !== undefined && scrollRef.current) {
        scrollRef.current.scrollToPosition(0, yPosition - 20, true);
      }
    }
  };

  const toggleAccess = (val: string) => {
    setAppAccess((curr) =>
      curr.includes(val) ? curr.filter((x) => x !== val) : [...curr, val]
    );
  };

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Nama akses wajib diisi";
    if (!desc.trim()) e.desc = "Deskripsi wajib diisi";
    if (appAccess.length === 0) e.access = "Pilih minimal 1 access";

    setErrors(e);

    // 👇 Auto Scroll jika ada error lokal
    if (Object.keys(e).length > 0) {
      scrollToFirstError(Object.keys(e));
      return false;
    }
    return true;
  };

  const { permissions } = useRolePermissionStore.getState();

  const formattedPermissions = Object.entries(permissions).map(
    ([pageId, actions]) => ({
      page_id: pageId,
      actions,
    })
  );

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        description: desc.trim(),
        appAccess: appAccess,
        permissions: formattedPermissions,
        rootPath,
        basePath
      };

      const result = await addAksesPengguna(payload);

      // 👇 4. Handle Backend Errors (Array Format)
      if (!result.success && result.errors && Array.isArray(result.errors)) {
        const backendErrors: any = {};
        const errorKeys: string[] = [];

        result.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
          errorKeys.push(err.field);
        });

        setErrors(backendErrors);
        showSnackbar("Terdapat kesalahan validasi", "error");
        
        // Auto Scroll
        scrollToFirstError(errorKeys);
        return;
      }

      // Universal Handler
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Berhasil ditambahkan", "success");
      resetPermissions();
      router.back();

    } catch (err) {
      console.error("🔥 Error add:", err);
      // Fallback scroll on network error with validation response
      handleBackendError(err, (e) => {
          setErrors(e);
          if (e && Object.keys(e).length > 0) scrollToFirstError(Object.keys(e));
      }, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Akses Pengguna" showBack />

      {/* 👇 Ganti ScrollView dengan KeyboardAwareScrollView */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        showsVerticalScrollIndicator={false}
      >

        {/* 👇 Wrap Input dengan View onLayout */}
        <View onLayout={handleLayout("name")}>
          <ValidatedInput
            label="Nama Akses"
            required
            placeholder="Supervisor, Kasir, Admin..."
            value={name}
            onChangeText={setName}
            error={errors.name} // Key: name
          />
        </View>

        <View onLayout={handleLayout("desc")}>
          <ValidatedInput
            label="Deskripsi"
            required
            placeholder="Deskripsi Akses"
            value={desc}
            onChangeText={setDesc}
            error={errors.desc} // Key: desc
          />
        </View>

        {/* Section App Access */}
        <View onLayout={handleLayout("access")}>
          <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: "600" }}>
            App Access *
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Chip
              selected={appAccess.includes("admin")}
              onPress={() => toggleAccess("admin")}
              showSelectedOverlay
            >
              Admin Dashboard
            </Chip>

            <Chip
              selected={appAccess.includes("operational")}
              onPress={() => toggleAccess("operational")}
              showSelectedOverlay
            >
              Operasional App
            </Chip>
          </View>
          
          {errors.access && (
            <Text style={{ color: "red", marginTop: 6, fontSize: 12 }}>
              {errors.access}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/akses_pengguna/edit/akses_admin", // Perbaiki path jika perlu (tambah / diawal)
              params: { rootPath, basePath },
            })
          }
          style={{
            marginTop: 30,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 14,
            borderColor: "#ddd",
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Atur Halaman Admin
          </Text>
          <Ionicons name="chevron-forward" size={22} color="#333" />
        </Pressable>

        {/* 👇 Tombol Submit yang diperbarui */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading} // Spinner di dalam tombol
          disabled={loading} // Disable saat loading
          style={{ marginTop: 30 }}
        >
          {loading ? "Menyimpan..." : "Tambah Role"}
        </Button>

      </KeyboardAwareScrollView>
    </View>
  );
}