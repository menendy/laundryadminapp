import React, { useState } from "react";
import { View, Pressable, Text, Platform } from "react-native";
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

// 🔥 IMPORT AUTH STORE
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { signInWithGoogle } = useGoogleAuthNative();
  
  // 🔥 INISIALISASI QUERY CLIENT
  const queryClient = useQueryClient();

  // ✅ FIX 1: STATE LOADING TERPISAH
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Helper: Disable input jika ada proses apapun
  const isAnyLoading = emailLoading || googleLoading;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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

      // ✅ FIX 2: PAKSA REFRESH TOKEN
      const token = await user.getIdToken(true); 

      // ✅ FIX 3: FORCE UPDATE ZUSTAND STORE
      const userData = {
        uid: user.uid,
        email: user.email || "",
      };

      // Panggil aksi 'login' dari store secara manual
      useAuthStore.getState().login(userData, null, token);

      // ✅ FIX 4: BERSIHKAN QUERY CACHE
      await queryClient.cancelQueries(); 
      queryClient.removeQueries(); 
      queryClient.clear(); 

      // ✅ FIX 5: NAVIGASI
      setTimeout(() => {
        router.replace("/");
      }, 100); 

      return true;
    } catch (err: any) {
      const data = err?.response?.data;

      // 🔥 BACKEND ERROR → SNACKBAR
      if (data?.message) {
        showSnackbar(data.message, "error");
        return false; 
      }

      // 🔥 ERROR TEKNIS
      throw err;
    }
  };

  // ============================
  // 🔐 LOGIN EMAIL
  // ============================
  const handleLogin = async () => {
    try {
      // 🔥 Gunakan state khusus email
      setEmailLoading(true);
      setFormError(null); 

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
      // 🔥 Matikan loading email saja
      setEmailLoading(false);
    }
  };

  // ============================
  // 🔑 LOGIN GOOGLE
  // ============================
  const handleLoginGoogle = async () => {
    if (googleLoading) return;

    try {
      setGoogleLoading(true);

      if (Platform.OS === "web") {
        await signInWithGooglePopup();
      } else {
        await signInWithGoogle();
      }

      await afterLoginSuccess();
    } catch (err: any) {
      console.log("Google Login Error Full:", err); 

      // ✅ FIX FINAL: DETEKSI ERROR CUSTOM "idToken kosong"
      const errString = String(err);
      const errCode = err.code ? String(err.code) : "";
      const errMessage = err.message ? String(err.message).toLowerCase() : "";

      const isCancelled = 
        // 1. Web & Native Codes Standard
        errCode === "auth/popup-closed-by-user" ||       
        errCode === "auth/cancelled-popup-request" ||    
        errCode === "auth/user-cancelled" ||             
        errCode === "12501" ||                           
        errCode === "13" ||
        errCode === "SIGN_IN_CANCELLED" ||               
        errCode === "-5" ||                              
        
        // 2. Message Check
        errMessage.includes("cancel") ||              
        
        // 3. 🔥 KHUSUS ERROR DARI HELPER ANDA (Berdasarkan Log)
        errString.includes("idToken kosong"); 

      if (isCancelled) {
        //console.log("User membatalkan login Google (Terdeteksi)");
        // Silent return, loading mati di finally
        return;
      } else {
        // Tampilkan error asli jika bukan cancel
        const fallbackMsg = err.message || "Terjadi kesalahan saat login Google";
        const message = firebaseErrorMessages[err?.code] || fallbackMsg;
          
        showSnackbar(message, "error");
      }
    } finally {
      setGoogleLoading(false);
    }
  };
  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
        Login Aplikasi
      </Text>

      <ValidatedInput 
        label="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
        // Disable input saat salah satu proses berjalan
        //disabled={isAnyLoading} 
      />
      
      <ValidatedInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={isPasswordSecure}
        //disabled={isAnyLoading}
        right={
          <TextInput.Icon 
            icon={isPasswordSecure ? "eye" : "eye-off"} 
            onPress={() => setIsPasswordSecure(!isPasswordSecure)}
            forceTextInputFocus={false}
            style={{ marginRight: 25 }}
          />
        }
      />

      {/* 👇 TOMBOL LOGIN EMAIL */}
      <Button
        mode="contained"
        onPress={handleLogin}
        // 🔥 HANYA Loading jika 'emailLoading' true
        loading={emailLoading}
        // Disabled jika emailLoading true ATAU googleLoading true
        disabled={isAnyLoading}
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

      {/* 👇 TOMBOL LOGIN GOOGLE */}
      <Button
        mode="outlined"
        onPress={handleLoginGoogle}
        // 🔥 HANYA Loading jika 'googleLoading' true
        loading={googleLoading}
        // Disabled jika salah satu loading
        disabled={isAnyLoading}
        icon="google"
        style={{ borderColor: "#4285F4" }}
        labelStyle={{ color: "#4285F4", fontWeight: "600" }}
      >
        Sign in with Google
      </Button>
    </View>
  );
}