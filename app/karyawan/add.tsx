import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import { Button, Checkbox } from "react-native-paper"; // Hapus ActivityIndicator dari sini jika tidak dipakai lagi
import { useRouter } from "expo-router";

// Library Keyboard Aware
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import DropDownPicker from "react-native-dropdown-picker";
import { addMitra } from "../../services/api/mitraService";
import { getRoleListLite } from "../../services/api/rolesService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";
import { useBasePath } from "../../utils/useBasePath";

export default function AddKaryawanScreen() {
  const router = useRouter();
  const { rootBase: rootPath, basePath } = useBasePath();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // 1️⃣ REF untuk ScrollView dan Layout Tracking
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const fieldYCoords = useRef<{ [key: string]: number }>({});

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [assignRole, setAssignRole] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleId, setRoleId] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // 2️⃣ URUTAN FIELD DI UI (Penting untuk menentukan mana yang paling atas)
  const fieldOrder = [
    "name",
    "password",
    "confirm",
    "nama", // alias
    "phone",
    "email",
    "address",
    "roleId"
  ];

  // 3️⃣ Helper untuk menyimpan posisi Y setiap input
  const handleLayout = (fieldName: string) => (event: LayoutChangeEvent) => {
    fieldYCoords.current[fieldName] = event.nativeEvent.layout.y;
  };

  // 4️⃣ Fungsi Auto Scroll ke Error Pertama
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
    if (!nama.trim()) e.name = "Nama tidak boleh kosong";
    if (!telp.trim()) e.phone = "Nomor Telepon tidak boleh kosong";
    if (!alamat.trim()) e.address = "Alamat tidak boleh kosong";
    if (!password.trim()) e.password = "Password tidak boleh kosong";
    if (!confirm.trim()) e.confirm = "Konfirmasi Password tidak boleh kosong";
    if (password.trim() && confirm.trim() && password.trim() !== confirm.trim()) {
      e.confirm = "Password tidak sama";
    }
    if (!alias.trim()) e.nama = "Nama panggilan tidak boleh kosong";
    if (!email.trim()) e.email = "Email tidak boleh kosong";
    if (assignRole && (!roleId || roleId.length === 0)) {
      e.roleId = "Pilih level akses terlebih dahulu";
    }

    setErrors(e);

    if (Object.keys(e).length > 0) {
      scrollToFirstError(Object.keys(e));
      return false;
    }
    return true;
  };

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await getRoleListLite(rootPath, basePath);
      if (res.success) {
        setRoles(
          res.data.map((r: any) => ({
            label: r.name,
            value: r.id,
          }))
        );
      }
    } catch (err) {
      console.error("loadRoles error:", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

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
        address: alamat.trim(),
        role_ids: assignRole ? roleId : null,
        email: email.trim(),
        password,
        confirm,
        rootPath,
        basePath,
      };

      const result = await addMitra(payload);

      if (!result.success && result.errors && Array.isArray(result.errors)) {
        const backendErrors: any = {};
        const errorKeys: string[] = [];

        result.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
          errorKeys.push(err.field);
        });

        setErrors(backendErrors);
        showSnackbar("Terdapat kesalahan validasi", "error");

        scrollToFirstError(errorKeys);
        return;
      }

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Berhasil ditambahkan", "success");
      router.back(); 
    } catch (err: any) {
      console.error("🔥 Error addKaryawan:", err);
      handleBackendError(err, (e) => {
          setErrors(e);
          if (e && Object.keys(e).length > 0) scrollToFirstError(Object.keys(e));
      }, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  // ❌ BAGIAN INI DIHAPUS AGAR TIDAK MUNCUL SPINNER fullscreen SAAT SUBMIT
  /* if (loading || loadingRoles) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } 
  */

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Karyawan" showBack />

      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 150,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        showsVerticalScrollIndicator={false}
      >
        
        <View onLayout={handleLayout("name")}>
          <ValidatedInput
            label="Nama Lengkap"
            required
            placeholder="Contoh: Ridwan Tamar"
            value={nama}
            onChangeText={setNama}
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

        <View onLayout={handleLayout("nama")}>
          <ValidatedInput
            label="Nama Panggilan"
            placeholder="Contoh: Ridwan"
            value={alias}
            onChangeText={setAlias}
            error={errors.nama}
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
            error={errors.phone}
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
            error={errors.email}
          />
        </View>

        <View onLayout={handleLayout("address")}>
          <ValidatedInput
            label="Alamat"
            required
            placeholder="Jl. Mawar No. 10"
            value={alamat}
            onChangeText={setAlamat}
            error={errors.address}
            multiline={true}
            style={{ minHeight: 80, textAlignVertical: 'top' }} 
          />
        </View>

        <View onLayout={handleLayout("roleId")}>
          <Pressable
            onPress={() => setAssignRole((v) => !v)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 25,
            }}
          >
            <Checkbox
              status={assignRole ? "checked" : "unchecked"}
              onPress={() => setAssignRole((v) => !v)}
            />
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#007AFF" }}>
              Berikan akses Admin
            </Text>
          </Pressable>

          {assignRole && (
            <View style={{ marginTop: 20, zIndex: 2000 }}>
              <Text style={{ fontWeight: "600", marginBottom: 6 }}>
                Level Akses *
              </Text>
              <DropDownPicker
                multiple={false}
                mode="SIMPLE"
                open={dropdownOpen}
                value={roleId[0] ?? null}
                items={roles}
                setOpen={setDropdownOpen}
                setValue={(callback) => {
                  const selected = callback(roleId[0]);
                  setRoleId(selected ? [selected] : []);
                }}
                setItems={setRoles}
                placeholder="Pilih Item"
                searchable
                listMode="SCROLLVIEW"
                zIndex={3000}
                zIndexInverse={1000}
                style={{
                  borderColor: errors.roleId ? "red" : "#ccc",
                }}
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
              {errors.roleId && (
                <Text style={{ color: "red", marginTop: 4 }}>{errors.roleId}</Text>
              )}
            </View>
          )}
        </View>

        {/* 👇 TOMBOL INI AKAN MENAMPILKAN TEXT LOADING */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading} // Menampilkan spinner kecil di dalam tombol
          disabled={loading || loadingRoles} // Disable tombol saat loading
          style={{ marginTop: 25 }}
        >
          {loading ? "Menyimpan..." : "Tambah Karyawan"}
        </Button>

      </KeyboardAwareScrollView>
    </View>
  );
}