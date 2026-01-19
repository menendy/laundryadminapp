import React, { useState, useRef } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

// 👇 1. Import Library Keyboard Aware
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addSysadmin } from "../../services/api/sysadminService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddSysadminScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // 👇 2. Setup Refs
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const fieldYCoords = useRef<{ [key: string]: number }>({});

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 👇 3. Urutan Field UI (Untuk prioritas scroll)
  const fieldOrder = ["name", "password", "confirm", "alias", "phone", "email"];

  // Helper: Simpan koordinat Y
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

  const validate = () => {
    const e: any = {};

    // 👇 Validasi Lengkap & Konsisten
    if (!nama.trim()) e.name = "Nama tidak boleh kosong";
    if (!password.trim()) e.password = "Password tidak boleh kosong";
    
    if (!confirm.trim()) e.confirm = "Konfirmasi password wajib diisi";
    if (password && confirm && password !== confirm) {
        e.confirm = "Password tidak sama";
    }

    if (!alias.trim()) e.alias = "Nama panggilan tidak boleh kosong";
    if (!telp.trim()) e.phone = "Nomor Telepon tidak boleh kosong";
    if (!email.trim()) e.email = "Email tidak boleh kosong";

    setErrors(e);

    // Scroll jika ada error lokal
    if (Object.keys(e).length > 0) {
      scrollToFirstError(Object.keys(e));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: nama.trim(),
        alias: alias.trim(),
        phone: telp.trim(),
        email: email.trim(),
        password: password,
        confirm: confirm,
      };

      const result = await addSysadmin(payload);

      // 👇 4. Handle Error Backend (Array Validation)
      if (!result.success && result.errors && Array.isArray(result.errors)) {
        const backendErrors: any = {};
        const errorKeys: string[] = [];

        result.errors.forEach((err: any) => {
          // Mapping field jika backend menggunakan nama berbeda (misal: telp -> phone)
          const fieldKey = err.field === "telp" ? "phone" : err.field;
          
          backendErrors[fieldKey] = err.message;
          errorKeys.push(fieldKey);
        });

        setErrors(backendErrors);
        showSnackbar("Terdapat kesalahan validasi", "error");
        
        // Trigger auto scroll
        scrollToFirstError(errorKeys);
        return;
      }

      // Fallback handler
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Sysadmin berhasil ditambahkan", "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error addSysadmin:", err);
      // Handle network error scroll fallback
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
      <AppHeaderActions title="Tambah Sysadmin" showBack />

      {/* 👇 Wrapper KeyboardAwareScrollView */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        showsVerticalScrollIndicator={false}
      >
        {/* 👇 Wrap Inputs with onLayout */}
        
        <View onLayout={handleLayout("name")}>
          <ValidatedInput
            label="Nama Lengkap"
            required
            placeholder="Contoh: Ridwan Tamar"
            value={nama}
            onChangeText={setNama}
            error={errors.name} // Key: name
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

        <View onLayout={handleLayout("alias")}>
          <ValidatedInput
            label="Nama Panggilan"
            placeholder="Contoh: Ridwan"
            value={alias}
            onChangeText={setAlias}
            error={errors.alias} // Key: alias (Fixed bug from previous code)
          />
        </View>

        <View onLayout={handleLayout("phone")}>
          <ValidatedInput
            label="Nomor Telepon"
            required
            keyboardType="phone-pad"
            placeholder="812xxxxxxx"
            value={telp}
            onChangeText={(v) => {
              let clean = v.replace(/[^0-9]/g, "");
              if (clean.startsWith("0")) clean = clean.substring(1);
              setTelp(clean);
            }}
            error={errors.phone} // Key: phone
            prefix={<Text style={{ fontSize: 16, color: "#555" }}>+62</Text>}
          />
        </View>

        <View onLayout={handleLayout("email")}>
          <ValidatedInput
            label="Email"
            required
            keyboardType="email-address"
            placeholder="contoh: laundry@gmail.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email} // Key: email
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 25 }}
        >
          {loading ? "Menyimpan..." : "Tambah Sysadmin"}
        </Button>
      </KeyboardAwareScrollView>
    </View>
  );
}