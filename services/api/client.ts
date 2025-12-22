import axios, {
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { Platform } from "react-native";
import { API_BASE_URL } from "../../constants/env";
import { useAuthStore } from "../../store/useAuthStore";

// WEB
import { auth as webAuth } from "../firebase.web";

// NATIVE
import authNative from "@react-native-firebase/auth";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

type AuthState = ReturnType<typeof useAuthStore.getState>;

// ================================
// ⏳ WAIT UNTIL AUTH READY
// ================================
function waitForAuthReady(): Promise<void> {
  return new Promise((resolve) => {
    const unsub = useAuthStore.subscribe((state: AuthState) => {
      if (state.authReady) {
        unsub();
        resolve();
      }
    });

    // fallback (kalau sudah ready)
    if (useAuthStore.getState().authReady) {
      unsub();
      resolve();
    }
  });
}

// ==========================================
// 🔐 REQUEST INTERCEPTOR — FINAL STABLE
// ==========================================
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = useAuthStore.getState();

    // 1️⃣ TUNGGU AUTH READY
    if (!store.authReady) {
      await waitForAuthReady();
    }

    const { user, activeTenant, token } = useAuthStore.getState();

    // Public API
    if (!user) {
      return config;
    }

    // 2️⃣ Firebase = source of truth
    const fbUser =
      Platform.OS === "web"
        ? webAuth.currentUser
        : authNative().currentUser;

    if (!fbUser) {
      // auth resolved tapi user null
      return config;
    }

    // 3️⃣ Ambil token terbaru (cached oleh Firebase)
    const freshToken = await fbUser.getIdToken();

    // 4️⃣ Sync store jika berubah
    if (freshToken !== token) {
      useAuthStore.getState().login(
        { uid: fbUser.uid, email: fbUser.email ?? "" },
        activeTenant,
        freshToken
      );
    }

    // 5️⃣ Inject Authorization
    config.headers.Authorization = `Bearer ${freshToken}`;

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
