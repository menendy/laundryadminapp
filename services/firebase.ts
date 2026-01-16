// services/firebase.ts
import { Platform } from "react-native";
import { getAuth } from "@react-native-firebase/auth";

let firebase: any;

if (Platform.OS === "web") {
  firebase = require("./firebase.web");
} else {
  firebase = require("./firebase.native");
}

// ===============================
// 🔐 AUTH (LEGACY EXPORT — JANGAN DIPAKAI BARU)
// ===============================
export const auth = firebase.auth;

// ===============================
// 🔐 BASIC AUTH
// ===============================
export const signInWithEmailAndPassword =
  firebase.signInWithEmailAndPassword;

export const signOut = firebase.signOut;

export const sendPasswordResetEmail =
  firebase.sendPasswordResetEmail;

// ===============================
// 🔑 GOOGLE
// ===============================
export const signInWithGooglePopup =
  firebase.signInWithGooglePopup;

export const signInWithGoogleCredential =
  firebase.signInWithGoogleCredential;

export const signInWithGoogleNative =
  firebase.signInWithGoogleNative;

// ===============================
// 🔄 TOKEN (SAFE, SINGLE SOURCE)
// ===============================
export const getFreshIdToken = async (forceRefresh = false): Promise<string> => {
  const user = Platform.OS === "web"
      ? firebase.auth?.currentUser
      : getAuth().currentUser;

  if (!user) throw new Error("Firebase user is null");

  // ✅ Tambahkan getIdToken
  return user.getIdToken(forceRefresh); 
};
