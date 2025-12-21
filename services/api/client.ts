import axios, {
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { API_BASE_URL } from "../../constants/env";
import { useAuthStore } from "../../store/useAuthStore";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ==========================================
// REQUEST INTERCEPTOR — AUTO TOKEN INJECTION
// ==========================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
