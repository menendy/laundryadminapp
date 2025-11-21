// store/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Web fallback: localStorage
const webStorage = {
  async getItem(key: string) {
    return Promise.resolve(localStorage.getItem(key));
  },
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  async removeItem(key: string) {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

/**
 * Hybrid Storage:
 * - Web  → browser localStorage
 * - Mobile → AsyncStorage
 */
export const Storage = Platform.OS === "web" ? webStorage : AsyncStorage;
