import React, { useState, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import ValidatedInput from "../../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { useBasePath } from "../../../utils/useBasePath";
import { handleBackendError } from "../../../utils/handleBackendError";

import { getOutletById, updateOutlet } from "../../../services/api/outletsService";

export default function EditOutletScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { rootBase: rootPath, basePath } = useBasePath();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [errors, setErrors] = useState<any>({});

  /* ================= LOAD DATA (WITH FOCUS GUARD) ================= */

  /**
   * ✅ REFACTOR: Menggunakan useFocusEffect + isMounted.
   * Ini mencegah 'Ghost Fetching' agar API outlet tidak bocor ke screen lain
   * saat navigasi Stack dilakukan.
   */
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        if (!id) return;
        
        setLoadingFetch(true);
        try {
          const result = await getOutletById(id as string, rootPath, basePath);
          
          // Guard: Hanya update state jika screen masih fokus
          if (isMounted) {
            setName(result.name || "");
            setPhone((result.phone || "").replace(/^(\+62|62)/, "")); // hilangkan prefix
            setAddress(result.address || "");
          }
        } catch (err) {
          if (isMounted) {
            console.error("❌ Error getOutletById:", err);
            showSnackbar("Gagal memuat data outlet", "error");
          }
        } finally {
          if (isMounted) {
            setLoadingFetch(false);
          }
        }
      };

      fetchData();

      return () => {
        // Cleanup: Saat user pindah ke screen lain, isMounted jadi false.
        isMounted = false;
      };
    }, [id, rootPath, basePath])
  );

  /* ================= VALIDATION & SUBMIT ================= */

  const validate = () => {
    const e: any = {};
    if (!name.trim()) e.name = "Nama Outlet wajib diisi";
    if (!phone.trim()) e.phone = "Nomor telepon wajib diisi";
    if (!address.trim()) e.address = "Alamat wajib diisi";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id,
        name,
        address,
        phone,
        rootPath,
        basePath,
      };

      const result = await updateOutlet(String(id), payload);

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Berhasil diperbarui", "success");
      router.back(); // Kembali ke list/detail

    } catch (err) {
      console.error("🔥 Error updateOutlet:", err);
      handleBackendError(err, setErrors, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI RENDERING ================= */

  if (loadingFetch) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeaderActions title="Edit Outlet" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <ValidatedInput
          label="Nama Outlet"
          required
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

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
          prefix={<Text style={styles.phonePrefix}>+62</Text>}
        />

        <ValidatedInput
          label="Alamat Outlet"
          required
          value={address}
          onChangeText={setAddress}
          error={errors.address}
          multiline
          numberOfLines={3}
          style={styles.addressInput}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
  },
  phonePrefix: {
    fontSize: 16,
    color: "#555",
  },
  addressInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  submitButtonContent: {
    height: 48,
  },
});