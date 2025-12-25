// services/firebase.web.ts
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { firebaseConfig } from "./firebaseConfig";

let _auth: ReturnType<typeof getAuth> | null = null;

function getWebAuth() {
  if (!_auth) {
    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);

    _auth = getAuth(app);
  }
  return _auth;
}

export const auth = {
  get current() {
    return getWebAuth();
  },
};

// ===============================
// 🔐 WRAPPER (INI KUNCI FIX)
// ===============================
export const sendPasswordResetEmail = async (_auth: any, email: string) => {
  return firebaseSendPasswordResetEmail(getWebAuth(), email);
};

// ===============================
// EXPORT LAIN (AMAN)
// ===============================
export { signInWithEmailAndPassword, signOut };

// ===============================
// GOOGLE LOGIN (WEB ONLY)
// ===============================
export const signInWithGooglePopup = async () => {
  const auth = getWebAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return await signInWithPopup(auth, provider);
};
