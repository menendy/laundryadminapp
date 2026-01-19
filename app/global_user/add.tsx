import React, { useState, useRef } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

// 👇 1. Import Library Keyboard Aware
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addGlobalUser } from "../../services/api/globaluserService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddGlobalUser() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // 👇 2. Setup Refs untuk Scroll dan Koordinat Layout
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

  // 👇 3. Daftar Urutan Field (Sesuai Tampilan UI dari Atas ke Bawah)
  // Ini penting agar sistem tahu mana error yang "paling atas"
  const fieldOrder = ["name", "password", "confirm", "alias", "phone", "email"];

  // Helper: Simpan Posisi Y Input saat layout dirender
  const handleLayout = (fieldName: string) => (event: LayoutChangeEvent) => {
    fieldYCoords.current[fieldName] = event.nativeEvent.layout.y;
  };

  // Helper: Scroll ke Error Paling Atas
  const scrollToFirstError = (errorFields: string[]) => {
    // Cari field error yang urutannya paling awal di UI
    const firstErrorField = fieldOrder.find(field => errorFields.includes(field));
    
    if (firstErrorField) {
      const yPosition = fieldYCoords.current[firstErrorField];
      // Scroll ke posisi tersebut (dikurangi 20px sebagai jarak aman)
      if (yPosition !== undefined && scrollRef.current) {
        scrollRef.current.scrollToPosition(0, yPosition - 20, true);
      }
    }
  };

  const validate = () => {
    const e: any = {};

    // 👇 Validasi Lengkap
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

    // Jika ada error lokal, langsung scroll ke error pertama
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

      const result = await addGlobalUser(payload);

      // 👇 4. Handling Error Backend Array & Auto Scroll
      // Jika backend mengembalikan format { success: false, errors: [...] }
      if (!result.success && result.errors && Array.isArray(result.errors)) {
        const backendErrors: any = {};
        const errorKeys: string[] = [];

        result.errors.forEach((err: any) => {
          // Mapping field backend ke field frontend jika nama berbeda
          // (Misal backend kirim 'telp', frontend pakai 'phone')
          const fieldKey = err.field === "telp" ? "phone" : err.field; 
          
          backendErrors[fieldKey] = err.message;
          errorKeys.push(fieldKey);
        });

        setErrors(backendErrors);
        showSnackbar("Terdapat kesalahan validasi", "error");
        
        // Auto scroll ke error backend
        scrollToFirstError(errorKeys);
        return;
      }

      // Fallback ke handler standar jika error bukan format validasi
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Berhasil ditambahkan", "success");
      // router.back();
    } catch (err) {
      console.error("🔥 Error addUserGlobal:", err);
      // Jika error koneksi/axios, tetap coba scroll jika ada response error data
      handleBackendError(err, (e) => {
          setErrors(e);
          if (e && Object.keys(e).length > 0) {
            scrollToFirstError(Object.keys(e));
          }
      }, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah User Global" showBack />

      {/* 👇 Ganti ScrollView biasa dengan KeyboardAwareScrollView */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120, // Jarak aman bawah
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        showsVerticalScrollIndicator={false}
      >
        {/* 👇 Wrap setiap Input dengan View onLayout */}
        
        <View onLayout={handleLayout("name")}>
          <ValidatedInput
            label="Nama Lengkap"
            required
            placeholder="Contoh: Ridwan Tamar"
            value={nama}
            onChangeText={setNama}
            error={errors.name} // Gunakan key 'name'
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
            error={errors.alias} // Perbaikan: Gunakan key 'alias'
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
            error={errors.phone} // Gunakan key 'phone'
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
            error={errors.email} // Perbaikan: Gunakan key 'email'
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 25 }}
        >
          {loading ? "Menyimpan..." : "Tambah User Global"}
        </Button>
      </KeyboardAwareScrollView>
    </View>
  );
}