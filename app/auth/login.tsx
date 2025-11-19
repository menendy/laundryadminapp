import React, { useState } from "react";
import { View,Platform  } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { loginUser } from "../../services/api/authService";
import { useRouter } from "expo-router";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { loadUserAccessFromClaims } from "../../services/auth/loadUserAccess";


export default function LoginScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore(s => s.showSnackbar);

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
      const res = await loginUser({ email, password });

      if (!res.success) {
        showSnackbar(res.message || "Login gagal", "error");
        return;
      }

      showSnackbar("Login berhasil!", "success");

      // simpan token (nanti kita buat store nya)
      // tokenStore.set(res.token);
      
      const userData = res.user;      // dari API
      const idToken = res.token;      // Firebase ID Token

      // ⬇⬇ SIMPAN di Zustand Store
      useAuthStore.getState().login(userData, idToken);

      // Khusus Web: simpan token ke sessionStorage
      if (Platform.OS === "web") {
        sessionStorage.setItem("auth-token", idToken);
        sessionStorage.setItem("auth-user", JSON.stringify(userData));
      }

      router.replace("/"); // pindah ke dashboard

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

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>
    </View>
  );
}
