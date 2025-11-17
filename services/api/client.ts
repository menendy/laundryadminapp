import axios from "axios";
import { API_BASE_URL } from "../../constants/env";
import { useAuthStore } from "../../store/useAuthStore"; // <-- pastikan sesuai lokasi

/**
 * instance global Axios
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Request Interceptor — Inject Bearer Token
 */
api.interceptors.request.use(async (config) => {
  try {
    const token = useAuthStore.getState().token; // ambil token dari Zustand store

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("⚠️ Cannot attach token:", e);
  }

  console.log(
    `🚀 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`
  );
  return config;
});

/**
 * Response Interceptor
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.warn(
        `⚠️ [API ${status}] ${error.config?.url} →`,
        JSON.stringify(data)
      );

      return Promise.resolve({
        data: {
          ...data,
          status,
          success: false,
        },
      });
    }

    console.error("❌ API Connection Error:", error.message);

    return Promise.resolve({
      data: {
        success: false,
        status: 0,
        message: "Tidak dapat terhubung ke server",
      },
    });
  }
);
