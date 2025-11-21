import { Platform } from "react-native";

let auth: any = null;
let db: any = null;

export async function initFirebase() {
  if (auth && db) return { auth, db }; // sudah diinisialisasi

  if (Platform.OS !== "web") {
    // Load native Firebase (React Native Firebase)
    const rnfbAuth = require("@react-native-firebase/auth").default;
    const rnfbFirestore = require("@react-native-firebase/firestore").default;

    auth = rnfbAuth();
    db = rnfbFirestore();
  } else {
    // Load Firebase Web SDK
    const { initializeApp } = await import("firebase/app");
    const { getAuth } = await import("firebase/auth");
    const { getFirestore } = await import("firebase/firestore");
    const { firebaseConfig } = await import("./firebaseConfig");

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { auth, db };
}

export { auth, db };
