import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { loginUser } from "../../services/api/authService";

import { auth } from "../../services/firebase"; // ← unified auth

import { useRouter } from "expo-router";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { login: loginStore } = useAuthStore.getState();

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

      // 🔥 Login web/native otomatis
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const fbUser = userCred.user;

      const claimRes = await loginUser({ uid: fbUser.uid });

      if (!claimRes.success) {
        showSnackbar(claimRes.message || "Gagal set klaim", "error");
        return;
      }

      await fbUser.getIdToken(true);

      loginStore(
        {
          uid: fbUser.uid,
          email: fbUser.email ?? "",
          ...claimRes.user,
        },
        claimRes.active_tenant
      );

      showSnackbar("Login berhasil!", "success");
      router.replace("/");
    } catch (err: any) {
      console.error("Login ERROR:", err);
      showSnackbar(err.message || "Terjadi kesalahan saat login", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <Text variant="titleLarge">Login Admin</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
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
