// === Firebase Native (Android/iOS) ===
console.log("🔥 firebase.native.ts (RNFirebase) LOADED");

// Default import untuk RNFirebase
import firebase from "@react-native-firebase/app";
import authModule from "@react-native-firebase/auth";

// ⚠️ native RNFirebase tidak pakai JS SDK
export const auth = authModule();
export default firebase.app();