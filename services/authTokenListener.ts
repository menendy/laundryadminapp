// services/authTokenListener.ts
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";

// WEB
import { auth as webAuth } from "./firebase.web";

// NATIVE
import authNative from "@react-native-firebase/auth";

/**
 * Firebase AUTH STATE LISTENER
 * - ctrl + R
 * - refresh tab
 * - app resume
 * - login / logout
 */
export function initAuthTokenListener() {
  const store = useAuthStore.getState();

  const handleUser = async (user: any) => {
    // ❌ BELUM LOGIN / LOGOUT
    if (!user) {
      store.logout();
      store.setAuthReady(true); // ⬅️ auth state resolved
      return;
    }

    const token = await user.getIdToken();

    store.login(
      { uid: user.uid, email: user.email ?? "" },
      store.activeTenant,
      token
    );

    store.setAuthReady(true);
  };

  // 🌐 WEB
  if (Platform.OS === "web") {
    return webAuth.onAuthStateChanged(handleUser);
  }

  // 📱 NATIVE
  return authNative().onAuthStateChanged(handleUser);
}
