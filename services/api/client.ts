import axios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { API_BASE_URL } from "../../constants/env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ==========================================
// REQUEST INTERCEPTOR — AUTO TOKEN INJECTION
// ==========================================
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Dynamic import universal firebase (web + mobile)
      const { auth, getIdToken } = await import("../firebase");

      const user = auth.currentUser;

      if (user && config.headers) {
        const token = await getIdToken(user, false);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("⚠️ Error attaching token:", err);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
