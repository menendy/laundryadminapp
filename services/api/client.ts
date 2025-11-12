import axios from "axios";
import { API_BASE_URL } from "../../constants/env";

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
 * Logging interceptor (optional)
 * Menampilkan log setiap request yang dikirim
 */
api.interceptors.request.use((config) => {
  console.log(
    `🚀 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`
  );
  return config;
});

/**
 * Response interceptor global
 * Semua error 4xx / 5xx dikonversi ke format seragam
 * Tidak ada throw/reject; semua dikembalikan via Promise.resolve
 */
api.interceptors.response.use(
  // CASE 1: sukses (status 2xx)
  (response) => {
    return response;
  },

  // CASE 2: gagal (status >= 400)
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.warn(
        `⚠️ [API ${status}] ${error.config?.url} →`,
        JSON.stringify(data)
      );

      // Bentuk respons error agar seragam
      const normalizedResponse = {
        ...data,
        status,
        success: false,
      };

      // Kembalikan dalam Promise.resolve agar tidak dilempar ke catch
      return Promise.resolve({
        data: normalizedResponse,
      });
    }

    // ❌ CASE 3: error koneksi / tidak ada respon sama sekali
    console.error("❌ API Connection Error:", error.message);

    const fallbackResponse = {
      data: {
        success: false,
        status: 0,
        message: "Tidak dapat terhubung ke server",
      },
    };

    return Promise.resolve(fallbackResponse);
  }
);
