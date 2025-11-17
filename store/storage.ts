// C:\Users\WIN10\laundryadminapp\store\storage.ts
import { Platform } from "react-native";

let NativeAsyncStorage: any = null;

// Only load AsyncStorage on native platforms
if (Platform.OS !== "web") {
  try {
    NativeAsyncStorage =
      require("@react-native-async-storage/async-storage").default;
  } catch (e) {
    console.warn("AsyncStorage not available:", (e as any)?.message ?? e);
  }
}

export const Storage = {
  async getItem(key: string) {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return NativeAsyncStorage ? await NativeAsyncStorage.getItem(key) : null;
    } catch (e) {
      console.log("Storage getItem error:", (e as any)?.message ?? e);
      return null;
    }
  },

  async setItem(key: string, value: string) {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      if (NativeAsyncStorage) {
        await NativeAsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.log("Storage setItem error:", (e as any)?.message ?? e);
    }
  },

  async removeItem(key: string) {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
      }
      if (NativeAsyncStorage) {
        await NativeAsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.log("Storage removeItem error:", (e as any)?.message ?? e);
    }
  },
};
