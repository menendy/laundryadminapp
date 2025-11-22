// useAuthStore.ts
import { Platform } from "react-native";

let store;

if (Platform.OS === "web") {
  store = require("./useAuthStore.web");
} else {
  store = require("./useAuthStore.native");
}

// Forward ALL named exports
export const useAuthStore = store.useAuthStore;
