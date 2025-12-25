import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { API_BASE_URL } from "../../constants/env";
import { useAuthStore } from "../../store/useAuthStore";
import { auth as webAuth } from "../firebase.web";
import { Platform } from "react-native";
import { getAuth } from "@react-native-firebase/auth";

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
// 🔐 REQUEST INTERCEPTOR (FIX)
// ================================
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = useAuthStore.getState();

    if (!store.authReady) {
      await waitForAuthReady();
    }

    let token: string | null = null;

    try {
      if (Platform.OS === "web") {
        const user = webAuth.current.currentUser;
        if (user) {
          token = await user.getIdToken(true); // 🔥 FORCE REFRESH
        }
      } else {
        const user = getAuth().currentUser;
        if (user) {
          token = await user.getIdToken(true);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Failed to refresh token", err);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
