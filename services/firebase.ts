import { Platform } from "react-native";

let firebase: any;

if (Platform.OS === "web") {
  firebase = require("./firebase.web");
} else {
  firebase = require("./firebase.native");
}

// ===============================
// 🔐 EXISTING
// ===============================
export const auth = firebase.auth;
export const signInWithEmailAndPassword = firebase.signInWithEmailAndPassword;
export const signOut = firebase.signOut;
export const sendPasswordResetEmail = firebase.sendPasswordResetEmail;

// ===============================
// 🔑 GOOGLE (TAMBAHAN, TANPA UBAH POLA)
// ===============================
export const signInWithGooglePopup = firebase.signInWithGooglePopup;
export const signInWithGoogleCredential = firebase.signInWithGoogleCredential;
export const signInWithGoogleNative = firebase.signInWithGoogleNative;


// ===============================
// 🔄 TOKEN (UNIVERSAL)
// ===============================
export const getIdToken = async (
  user: any,
  forceRefresh = false
): Promise<string> => {
  if (!user) throw new Error("User is null");
  return user.getIdToken(forceRefresh);
};
