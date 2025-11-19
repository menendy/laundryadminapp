// app/auth/login.tsx
import React, { useState } from "react";
import { View, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";

import { loginUser } from "../../services/api/authService";
import { loadUserAccessFromClaims } from "../../services/auth/loadUserAccess";

import { useRouter } from "expo-router";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { useAuthStore } from "../../store/useAuthStore";


export default function LoginScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showSnackbar("Email dan password wajib diisi", "error");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Login via Cloud Function
      const res = await loginUser({ email, password });

      if (!res.success) {
        showSnackbar(res.message || "Login gagal", "error");
        return;
      }

      showSnackbar("Login berhasil!", "success");

      // Ambil data kembali dari API
      const idToken = res.token;            // Firebase ID TOKEN
      const userData = res.user;
      const activeTenant = res.active_tenant;

      // Simpan ke Auth Store
      const authStore = useAuthStore.getState();
      await authStore.login(userData, idToken);

      // Simpan tenant
      if (activeTenant) {
        authStore.setActiveTenant(activeTenant);
      }

      // Load claims + role + permissions
      await loadUserAccessFromClaims(idToken);

      // Pindah ke dashboard
      router.replace("/");

    } catch (err) {
      console.log("❌ ERROR:", err);
      showSnackbar("Terjadi kesalahan saat login", "error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <Text variant="titleLarge" style={{ marginBottom: 20 }}>
        Login Admin
      </Text>

      <TextInput
        label="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ marginBottom: 10 }}
      />

      <Button mode="contained" onPress={handleLogin} loading={loading}>
        Login
      </Button>
    </View>
  );
}
