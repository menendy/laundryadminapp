import { Platform } from "react-native";

// ======== MOBILE (React Native Firebase) =========
let auth = null;
let db = null;

if (Platform.OS !== "web") {
  // Gunakan require agar hanya load di native
  const rnfbAuth = require("@react-native-firebase/auth").default;
  const rnfbFirestore = require("@react-native-firebase/firestore").default;

  // Tidak ada initializeApp manual untuk RNFB
  // RNFirebase otomatis load default app dari google-services.json

  auth = rnfbAuth();          // instance default app
  db = rnfbFirestore();
}

// ======== WEB (Firebase Web SDK) =========
if (Platform.OS === "web") {
  const { initializeApp } = require("firebase/app");
  const { getAuth } = require("firebase/auth");
  const { getFirestore } = require("firebase/firestore");
  const { firebaseConfig } = require("./firebaseConfig");

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
