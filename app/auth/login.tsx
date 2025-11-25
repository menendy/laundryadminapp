import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

import {
  auth,
  signInWithEmailAndPassword,
  getIdToken,
} from "../../services/firebase";   // 🔥 UNIVERSAL (web + native)

import { loginUser } from "../../services/api/authService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { firebaseErrorMessages } from "../../services/firebase-error";

import ValidatedInput from "../../components/ui/ValidatedInput";

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

      // ============================
      // 🔥 LOGIN (MODULAR API)
      // ============================
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;

      // ============================
      // 🔥 Ambil custom claims dari backend kamu
      // ============================
      const claimRes = await loginUser({ uid: fbUser.uid });

      if (!claimRes.success) {
        showSnackbar(claimRes.message || "Gagal memuat data user.", "error");
        return;
      }

      // ============================
      // 🔥 Refresh token untuk claim terbaru
      // ============================
      await getIdToken(fbUser, true);

      // ============================
      // 🔥 Simpan ke Zustand
      // ============================
      loginStore(
        {
          uid: fbUser.uid,
          email: fbUser.email ?? "",
        },
        claimRes.active_tenant
      );

      showSnackbar("Login berhasil!", "success");
      router.replace("/");
    } catch (err: any) {
      console.error("Login ERROR:", err);

      const message =
        firebaseErrorMessages[err?.code] ||
        "Tidak dapat login. Periksa email dan password Anda.";

      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <ValidatedInput
        label="Email"
        value={email}
        onChangeText={setEmail}
      />

      <ValidatedInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
  mode="contained"
  onPress={handleLogin}
  loading={loading}
  disabled={loading}
  style={{ marginTop: 12 }}
>
  Login
</Button>
    </View>
  );
}
