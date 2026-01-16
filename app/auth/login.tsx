import React, { useState } from "react";
import { View, Pressable, Text, Platform } from "react-native";
// ✅ 1. Tambahkan import TextInput dari react-native-paper
import { Button, TextInput } from "react-native-paper";
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

// 🔥 IMPORT QUERY CLIENT
import { useQueryClient } from "@tanstack/react-query";

export default function LoginScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { signInWithGoogle } = useGoogleAuthNative();
  
  // 🔥 INISIALISASI QUERY CLIENT
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ✅ 2. State untuk mengatur visibilitas password (default: true / tersembunyi)
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  // ============================
  // 🔐 AFTER LOGIN SUCCESS
  // ============================
  const afterLoginSuccess = async (): Promise<boolean> => {
    const authInstance = Platform.OS === "web" ? webAuth.current : getAuth();
    const user = authInstance.currentUser;

    if (!user) {
      throw new Error("Firebase user null after login");
    }

    try {
      // 1️⃣ Panggil Backend untuk set Custom Claims
      await loginUser({ uid: user.uid });

      // ✅ FIX 1: PAKSA REFRESH TOKEN
      await user.getIdToken(true); 

      // ✅ FIX 2: STOP & BERSIHKAN TOTAL
      await queryClient.cancelQueries(); 
      queryClient.clear(); 

      // ✅ FIX 3: NAVIGASI DENGAN JEDA
      setTimeout(() => {
        router.replace("/");
      }, 500); 

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
      setFormError(null); // Reset error form

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      {/* HEADER / LOGO JIKA ADA */}
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
        Login Aplikasi
      </Text>

      <ValidatedInput 
        label="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      {/* ✅ 3. Update ValidatedInput Password dengan Icon Toggle */}
      <ValidatedInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        // Gunakan state untuk menentukan hidden/show
        secureTextEntry={isPasswordSecure}
        // Tambahkan tombol mata di sebelah kanan
        right={
          <TextInput.Icon 
            icon={isPasswordSecure ? "eye" : "eye-off"} 
            onPress={() => setIsPasswordSecure(!isPasswordSecure)} 
            forceTextInputFocus={false}
            style={{ marginRight: 25 }}
          />
        }
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