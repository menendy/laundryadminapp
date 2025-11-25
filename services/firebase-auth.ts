import { Platform } from "react-native";

export function getAuth() {
  if (Platform.OS === "web") {
    const web = require("./firebase.web");
    return web.auth;
  }

  const native = require("./firebase.native");
  return native.auth;
}

export const auth = getAuth();
