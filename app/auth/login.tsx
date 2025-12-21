// app/auth/login.tsx
import React, { useState } from "react";
import { View, Pressable, Text, Platform } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

// WEB
import {
  auth as webAuth,
  signInWithEmailAndPassword as signInWithEmailWeb,
  signInWithGooglePopup,
} from "../../services/firebase.web";

// NATIVE
import authNative from "@react-native-firebase/auth";

import { useGoogleAuthNative } from "../../services/authGoogle.native";
import { loginUser } from "../../services/api/authService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { firebaseErrorMessages } from "../../services/firebase-error";

import ValidatedInput from "../../components/ui/ValidatedInput";

export default function LoginScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { login: loginStore } = useAuthStore.getState();
  const { signInWithGoogle } = useGoogleAuthNative();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================
  // 🔐 AFTER LOGIN SUCCESS
  // ============================
  const afterLoginSuccess = async (fbUser: any) => {
    const claimRes = await loginUser({ uid: fbUser.uid });
    if (!claimRes.success) return;

    const idToken = await fbUser.getIdToken(true);

    loginStore(
      { uid: fbUser.uid, email: fbUser.email ?? "" },
      claimRes.active_tenant,
      idToken
    );

    router.replace("/");
  };



  // ============================
  // 🔐 LOGIN EMAIL
  // ============================
  const handleLogin = async () => {
    try {
      setLoading(true);

      let fbUser;

      if (Platform.OS === "web") {
        const userCred = await signInWithEmailWeb(
          webAuth,
          email,
          password
        );
        fbUser = userCred.user;
      } else {
        const userCred = await authNative().signInWithEmailAndPassword(
          email,
          password
        );
        fbUser = userCred.user;
      }

      await afterLoginSuccess(fbUser);
    } catch (err: any) {
      console.log("EMAIL LOGIN ERROR:", err?.code, err?.message);

      const message =
        firebaseErrorMessages[err?.code] ||
        "Tidak dapat login. Periksa email dan password Anda.";

      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };


  // ============================
  // 🔑 LOGIN GOOGLE (FINAL)
  // ============================
  const handleLoginGoogle = async () => {
    try {
      setLoading(true);

      // 🌐 WEB (Firebase popup)
      if (Platform.OS === "web") {
        const result = await signInWithGooglePopup();
        await afterLoginSuccess(result.user);
        return;
      }

      // 📱 MOBILE (expo-auth-session)
      const result = await signInWithGoogle();
      await afterLoginSuccess(result.user);

    } catch (err) {
      console.error("Google Login ERROR:", err);
      showSnackbar("Login Google gagal.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <ValidatedInput label="Email" value={email} onChangeText={setEmail} />
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

      <Pressable
        onPress={() => router.push("/auth/forgot-password")}
        style={{ marginTop: 14, alignSelf: "center" }}
      >
        <Text style={{ color: "#1976D2", fontSize: 14, fontWeight: "500" }}>
          Lupa password?
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 20,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: "#DDD" }} />
        <Text style={{ marginHorizontal: 10, color: "#888" }}>atau</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#DDD" }} />
      </View>

      <Button
        mode="outlined"
        onPress={handleLoginGoogle}
        disabled={loading}
        icon="google"
        style={{ borderColor: "#4285F4" }}
        labelStyle={{ color: "#4285F4", fontWeight: "600" }}
      >
        Sign in with Google
      </Button>
    </View>
  );
}
