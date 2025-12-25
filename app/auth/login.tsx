// app/auth/login.tsx
import React, { useState } from "react";
import { View, Pressable, Text, Platform } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";

// WEB
import {
  auth as webAuth,
  signInWithEmailAndPassword as signInWithEmailWeb,
  signInWithGooglePopup,
} from "../../services/firebase.web";



// NATIVE GOOGLE
import { useGoogleAuthNative } from "../../services/authGoogle.native";

import { loginUser } from "../../services/api/authService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { firebaseErrorMessages } from "../../services/firebase-error";

import ValidatedInput from "../../components/ui/ValidatedInput";

export default function LoginScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { signInWithGoogle } = useGoogleAuthNative();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ============================
  // 🔐 AFTER LOGIN SUCCESS
  // ============================
  const afterLoginSuccess = async (): Promise<boolean> => {
    const user =
      Platform.OS === "web"
        ? webAuth.current.currentUser
        : getAuth().currentUser;

    if (!user) {
      throw new Error("Firebase user null after login");
    }

    try {
      await loginUser({ uid: user.uid });

      // ✅ backend OK
      router.replace("/");
      return true;
    } catch (err: any) {
      const data = err?.response?.data;

      // 🔥 BACKEND ERROR → SNACKBAR SAJA
      if (data?.message) {
        showSnackbar(data.message, "error");
        return false; // ⛔ stop flow
      }

      // 🔥 ERROR TEKNIS → lempar ke atas
      throw err;
    }
  };



  // ============================
  // 🔐 LOGIN EMAIL
  // ============================
  const handleLogin = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "web") {
        await signInWithEmailWeb(webAuth.current, email, password);
      } else {
        await signInWithEmailAndPassword(getAuth(), email, password);
      }

      await afterLoginSuccess();
    } catch (err: any) {
      const message =
        firebaseErrorMessages[err?.code] ||
        "Tidak dapat login. Periksa email dan password Anda.";

      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 🔑 LOGIN GOOGLE
  // ============================
  const handleLoginGoogle = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "web") {
        await signInWithGooglePopup();
      } else {
        await signInWithGoogle();
      }

      await afterLoginSuccess();
    } catch (err: any) {
      const message =
        firebaseErrorMessages[err?.code] ||
        "Tidak dapat login. Periksa email dan password Anda.";

      showSnackbar(message, "error");
      //showSnackbar("Login Google gagal.", "error");
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

      {formError && (
        <Text
          style={{
            color: "#E53935",
            fontSize: 13,
            textAlign: "center",
            marginTop: 6,
            marginBottom: 4,
          }}
        >
          {formError}
        </Text>
      )}

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
