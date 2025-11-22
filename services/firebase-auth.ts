// === UNIVERSAL AUTH SELECTOR ===
// Import hanya dari sini agar aman untuk Web & Native.

import { Platform } from "react-native";

export function getAuth() {
  if (Platform.OS === "web") {
    // ⬇ Web: JS SDK
    const web = require("./firebase.web");
    return web.auth;
  }

  // ⬇ Android/iOS: React Native Firebase
  const native = require("./firebase.native");
  return native.auth;
}

// Export default supaya simpel
export const auth = getAuth();
