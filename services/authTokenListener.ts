// services/authTokenListener.ts
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";

// 🌐 WEB
import { auth as webAuth } from "./firebase.web";

// 📱 NATIVE (MODULAR API)
import {
  getAuth,
  onIdTokenChanged,
  getIdToken,
} from "@react-native-firebase/auth";

/**
 * 🔐 AUTH + TOKEN LISTENER
 * - Dipanggil sekali saat app bootstrap
 * - Menangani:
 *   - restore session
 *   - login / logout
 *   - auto refresh token
 */
export function initAuthTokenListener() {
  const store = useAuthStore.getState();

  const handleUser = async (user: any) => {
    // 🚪 LOGOUT / SESSION HILANG
    if (!user) {
      store.logout();
      store.setAuthReady(true);
      return;
    }

    // ✅ WEB vs NATIVE (MODULAR)
    const token =
      Platform.OS === "web"
        ? await user.getIdToken() // Firebase Web SDK (AMAN)
        : await getIdToken(user); // RNFirebase Modular (WAJIB)

    store.login(
      {
        uid: user.uid,
        email: user.email ?? "",
      },
      store.activeTenant,
      token
    );

    store.setAuthReady(true);
    //const tokenResult = await user.getIdTokenResult();
    //console.log("ACTIVE TENANT:", tokenResult.claims.active_tenant);
  };

  // 🌐 WEB
  if (Platform.OS === "web") {
    return webAuth.current.onIdTokenChanged(handleUser);
  }

  // 📱 NATIVE
  return onIdTokenChanged(getAuth(), handleUser);
}
