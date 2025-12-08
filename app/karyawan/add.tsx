import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { Button, Checkbox, ActivityIndicator } from "react-native-paper";

import { useRouter } from "expo-router";

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

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [assignRole, setAssignRole] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleId, setRoleId] = useState<any[]>([]); // multi role


  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);


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
    return Object.keys(e).length === 0;
  };


  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await getRoleListLite();
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

      // 🔥 Universal handler untuk RESPON backend
      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("berhasil ditambahkan", "success");
      //router.back();

    } catch (err: any) {
      console.error("🔥 Error addKaryawan:", err);

      // 🔥 Pakai handler yang sama untuk NETWORK / AXIOS error
      handleBackendError(err, setErrors, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingRoles) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (

    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Karyawan" showBack />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120, // 👈 Tambah jarak aman untuk tombol + navbar
        }}
        keyboardShouldPersistTaps="handled" // 👈 optional biar input tetap fokus
      >
        <ValidatedInput
          label="Nama Lengkap"
          required
          placeholder="Contoh: Ridwan Tamar"
          value={nama}
          onChangeText={setNama}
          error={errors.name}
        />

        <ValidatedInput
          label="Password"
          required
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <ValidatedInput
          label="Konfirmasi Password"
          required
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
        />

        <ValidatedInput
          label="Nama Panggilan"

          placeholder="Contoh: Ridwan"
          value={alias}
          onChangeText={setAlias}
          error={errors.nama}
        />

        <ValidatedInput
          label="Nomor Telepon"
          required
          keyboardType="phone-pad"
          placeholder="812xxxxxxx"
          value={telp}
          onChangeText={(v) => {
            let clean = v.replace(/[^0-9]/g, "");

            if (clean.startsWith("0")) clean = clean.substring(1);

            // Jangan blokir update saat empty
            setTelp(clean);
          }}
          error={errors.phone}
          prefix={<Text style={{ fontSize: 16, color: "#555" }}>+62</Text>}
        />



        <ValidatedInput
          label="Email"
          required
          keyboardType="email-address"
          placeholder="contoh: laundry@gmail.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />



        <ValidatedInput
          label="Alamat"
          required
          placeholder="Jl. Mawar No. 10"
          value={alamat}
          onChangeText={setAlamat}
          error={errors.address}
        />

        {/* Checkbox Assign Role */}
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

        {/* Dropdown Role */}
        {assignRole && (
          <View style={{ marginTop: 20, zIndex: 2000 }}>
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>
              Level Akses *
            </Text>

            <DropDownPicker
              multiple={false}  // 👈 hanya 1 role
              mode="SIMPLE"     // 👈 tanpa badge multi

              open={dropdownOpen}
              value={roleId[0] ?? null}   // 👈 gunakan elemen pertama
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
            />

            {errors.roleId && (
              <Text style={{ color: "red", marginTop: 4 }}>{errors.roleId}</Text>
            )}
          </View>
        )}


        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 25 }}
        >
          {loading ? "Menyimpan..." : "Tambah Karyawan"}
        </Button>

      </ScrollView>
    </View>

  );
}
