// services/authGoogle.native.ts
import { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";

export function useGoogleAuthNative() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const signInWithGoogle = async () => {
    // 1️⃣ Pastikan Play Services tersedia
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // ============================================================
    // 🔥 TAMBAHAN PENTING: FORCE LOGOUT DULU
    // ============================================================
    // Kita lakukan signOut dulu dari Google SDK (bukan Firebase)
    // untuk menghapus cache sesi sebelumnya.
    // Ini akan memaksa popup "Pilih Akun" muncul kembali.
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      // Abaikan error jika user memang belum login sebelumnya
      console.log("Error signing out from Google SDK (ignored):", error);
    }
    // ============================================================

    // 2️⃣ Google Sign-In (Sekarang dialog pilih akun akan muncul)
    const userInfo = await GoogleSignin.signIn();

    const idToken = userInfo.data?.idToken;
    if (!idToken) {
      throw new Error("Google Sign-In gagal (idToken kosong)");
    }

    // 3️⃣ Firebase credential (MODULAR API)
    const credential = GoogleAuthProvider.credential(idToken);

    // 4️⃣ Firebase sign-in (MODULAR API)
    const auth = getAuth();
    const userCredential = await signInWithCredential(auth, credential);

    return userCredential;
  };

  return { signInWithGoogle };
}