import axios from "axios";
import { API_BASE_URL } from "../../constants/env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Optional: interceptor logging (debugging)
api.interceptors.request.use((config) => {
  console.log(`🚀 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
