import { Platform } from "react-native";

export const ENV = process.env.EXPO_PUBLIC_ENV || "development";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://asia-southeast2-laundry-apps-prod.cloudfunctions.net";

// Auto adjust untuk emulator Android
// if (ENV === "local" && Platform.OS === "android") {
//   API_BASE_URL = API_BASE_URL.replace("localhost", "10.0.2.2");
// }

// export { API_BASE_URL };
