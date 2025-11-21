import axios from "axios";
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
  async (config) => {
    try {
      // 👉 IMPORT DINAMIS — TIDAK MEN-TRIGGER INITIALIZE TERLALU AWAL
      const { auth } = await import("../firebase");

      const user = auth.currentUser;

      if (user && config.headers) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("⚠️ Error attaching token:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
