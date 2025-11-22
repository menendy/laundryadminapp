import React, { useState } from "react";
import { View, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { auth } from "../../services/firebase-auth";  // ⬅ gunakan selector aman
import { loginUser } from "../../services/api/authService";
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
    try {
      setLoading(true);

      if (!auth) {
        alert("Login via Firebase tidak tersedia di Web.");
        return;
      }

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
      showSnackbar(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <Text variant="titleLarge">Login Admin</Text>

      <TextInput label="Email" value={email} onChangeText={setEmail} />
      <TextInput label="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <Button mode="contained" onPress={handleLogin} loading={loading}>
        Login
      </Button>
    </View>
  );
}
