import React, { useState, useRef } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 👇 1. Import Library Keyboard Aware
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addOwner } from "../../services/api/ownersService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";
import { useBasePath } from "../../utils/useBasePath";

export default function AddOwnerScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();
  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // 👇 2. Setup Refs
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const fieldYCoords = useRef<{ [key: string]: number }>({});

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [outletName, setOutletName] = useState("");
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 👇 3. Urutan Field UI (Penting untuk prioritas scroll)
  const fieldOrder = [
    "name", 
    "password", 
    "confirm", 
    "phone", 
    "email", 
    "outletName", 
    "address"
  ];

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

  // =============================================================
  // VALIDASI
  // =============================================================
  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Nama owner wajib diisi";
    
    if (!password.trim()) e.password = "Password wajib diisi";
    if (!confirm.trim()) e.confirm = "Konfirmasi password wajib diisi";
    if (password && confirm && password !== confirm) {
        e.confirm = "Password tidak sama";
    }

    if (!phone.trim()) e.phone = "Nomor telepon wajib diisi";
    if (!email.trim()) e.email = "Email wajib diisi";
    
    if (!outletName.trim()) e.outletName = "Nama outlet wajib diisi";
    if (!address.trim()) e.address = "Alamat wajib diisi";

    setErrors(e);

    // 👇 Trigger scroll jika ada error lokal
    if (Object.keys(e).length > 0) {
      scrollToFirstError(Object.keys(e));
      return false;
    }
    return true;
  };

  // =============================================================
  // SUBMIT
  // =============================================================
  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      const result = await addOwner({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        outlet_name: outletName.trim(),
        password,
        confirm,
        rootPath,
        basePath,
      });

      // 👇 4. Handle Error Backend (Format Array)
      if (!result.success && result.errors && Array.isArray(result.errors)) {
        const backendErrors: any = {};
        const errorKeys: string[] = [];

        result.errors.forEach((err: any) => {
          // Mapping field backend ke frontend state jika nama beda
          let fieldKey = err.field;
          if (err.field === "outlet_name") fieldKey = "outletName"; 
          
          backendErrors[fieldKey] = err.message;
          errorKeys.push(fieldKey);
        });

        setErrors(backendErrors);
        showSnackbar("Terdapat kesalahan validasi", "error");
        
        // Auto Scroll
        scrollToFirstError(errorKeys);
        return;
      }

      // Fallback standard handler
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar(result.message ?? "Berhasil ditambahkan", "success");
      // router.back();
    } catch (err) {
      console.error("🔥 Error addOwner:", err);
      // Fallback scroll on network error with validation response
      handleBackendError(err, (e) => {
          setErrors(e);
          if (e && Object.keys(e).length > 0) scrollToFirstError(Object.keys(e));
      }, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  // =============================================================
  // RENDER
  // =============================================================
  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Owner" showBack />

      {/* 👇 Ganti ScrollView dengan KeyboardAwareScrollView */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120 + insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 👇 Wrap setiap input dengan View onLayout */}

        <View onLayout={handleLayout("name")}>
          <ValidatedInput
            label="Nama Owner"
            required
            placeholder="Contoh: PT Harmonia Laundry"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
        </View>

        <View onLayout={handleLayout("password")}>
          <ValidatedInput
            label="Password"
            required
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />
        </View>

        <View onLayout={handleLayout("confirm")}>
          <ValidatedInput
            label="Konfirmasi Password"
            required
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirm}
            secureTextEntry
          />
        </View>

        <View onLayout={handleLayout("phone")}>
          <ValidatedInput
            label="Nomor Telepon"
            required
            keyboardType="phone-pad"
            placeholder="812xxxxxxx"
            value={phone}
            onChangeText={(v) => {
              let clean = v.replace(/[^0-9]/g, "");
              if (clean.startsWith("0")) clean = clean.substring(1);
              setPhone(clean);
            }}
            error={errors.phone}
            prefix={<Text style={{ fontSize: 16, color: "#555" }}>+62</Text>}
          />
        </View>

        <View onLayout={handleLayout("email")}>
          <ValidatedInput
            label="Email"
            required
            keyboardType="email-address"
            placeholder="owner@domain.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
        </View>

        <View onLayout={handleLayout("outletName")}>
          <ValidatedInput
            label="Nama Outlet"
            required
            placeholder="Contoh: Outlet Depok"
            value={outletName}
            onChangeText={setOutletName}
            error={errors.outletName}
          />
        </View>

        <View onLayout={handleLayout("address")}>
          <ValidatedInput
            label="Alamat Outlet"
            required
            placeholder="Contoh Jl. Margonda Raya..."
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            multiline
            numberOfLines={3}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading ? "Menyimpan..." : "Tambah Owner"}
        </Button>

      </KeyboardAwareScrollView>
    </View>
  );
}