// services/firebase.web.ts
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  getIdToken,                // ✅ SDK ASLI
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { firebaseConfig } from "./firebaseConfig";

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ===============================
// ✅ EXISTING EXPORT (JANGAN DIUBAH POLANYA)
// ===============================
export {
  signInWithEmailAndPassword,
  getIdToken,               // 🔥 INI DARI SDK, BUKAN WRAPPER
  signOut,
  sendPasswordResetEmail,
};

// ===============================
// 🔑 GOOGLE LOGIN (WEB) — TETAP ADA
// ===============================
export const signInWithGooglePopup = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return await signInWithPopup(auth, provider);
};
