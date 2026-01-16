import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { API_BASE_URL } from "../../constants/env";
import { useAuthStore } from "../../store/useAuthStore";
import { auth as webAuth } from "../firebase.web";
import { Platform } from "react-native";

// ✅ FIX: Import getIdToken dari modular package
import { getAuth, getIdToken } from "@react-native-firebase/auth";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ================================
// ⏳ WAIT AUTH READY
// ================================
type AuthState = ReturnType<typeof useAuthStore.getState>;

function waitForAuthReady(): Promise<void> {
  return new Promise((resolve) => {
    const unsub = useAuthStore.subscribe((state: AuthState) => {
      if (state.authReady) {
        unsub();
        resolve();
      }
    });

    if (useAuthStore.getState().authReady) {
      unsub();
      resolve();
    }
  });
}

// ================================
// 🔐 REQUEST INTERCEPTOR
// ================================
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = useAuthStore.getState();

    // Tunggu sampai status auth diketahui (logged in atau anonymous)
    if (!store.authReady) {
      await waitForAuthReady();
    }

    let token: string | null = null;

    try {
      if (Platform.OS === "web") {
        // 🌐 WEB (Firebase JS SDK v9/v10)
        // Web SDK masih menggunakan instance method (.getIdToken)
        const user = webAuth.current.currentUser;
        if (user) {
          token = await user.getIdToken(true); // Force refresh
        }
      } else {
        // 📱 NATIVE (React Native Firebase v18+)
        // Menggunakan Modular API sesuai warning deprecated
        const user = getAuth().currentUser;
        if (user) {
          // ✅ FIX: Gunakan fungsi modular getIdToken(user, forceRefresh)
          token = await getIdToken(user, false); 
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Failed to refresh token", err);
      // Opsional: Handle logout jika refresh token gagal total (expired session)
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;