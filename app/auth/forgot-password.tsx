import React, { useState } from "react";
import { View, Text } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

import ValidatedInput from "../../components/ui/ValidatedInput";
import { checkForgotPassword } from "../../services/api/authService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

// 🔥 Firebase client
import { auth, sendPasswordResetEmail } from "../../services/firebase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

const handleSend = async () => {
  if (!email.trim()) {
    setErrors({ email: "Email wajib diisi" });
    return;
  }

  setLoading(true);
  setErrors({});

  // ============================
  // 1️⃣ VALIDASI BACKEND
  // ============================
  const check = await checkForgotPassword({ email: email.trim() });
  const ok = handleBackendError(check, setErrors, showSnackbar);

  if (!ok) {
    setLoading(false);
    return; // ⛔ STOP DI SINI, JANGAN LANJUT KE FIREBASE
  }

  // ============================
  // 2️⃣ FIREBASE RESET PASSWORD
  // ============================
  try {
    await sendPasswordResetEmail(auth, email.trim());

    showSnackbar(
      "Email reset password telah dikirim. Silakan cek inbox Anda.",
      "success"
    );

    router.back();
  } catch (err: any) {
    console.error("forgot password firebase error:", err);

    showSnackbar(
      "Gagal mengirim email reset password. Silakan coba lagi.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
        Lupa Password
      </Text>

      <Text style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
        Masukkan email yang terdaftar untuk menerima link reset password.
      </Text>

     <ValidatedInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  keyboardType="email-address"
  autoComplete="off"
  textContentType="none"
  required
/>


      <Button
        mode="contained"
        onPress={handleSend}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 12 }}
      >
        Kirim Email Reset
      </Button>
    </View>
  );
}
