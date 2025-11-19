import { config } from "dotenv";
import path from "path";

// Tentukan file .env berdasarkan argumen ENV
const envType = process.env.EXPO_PUBLIC_ENV || "local";

const envFile =
  envType === "production"
    ? ".env.production"
    : envType === "development"
    ? ".env.development"
    : ".env.local";

console.log(`🌱 Loading environment from: ${envFile}`);
config({ path: path.resolve(__dirname, envFile) });

export default {
  expo: {
    name: "laundryadminapp",
    slug: "laundryadminapp",
    version: "1.0.0",
    extra: {
      env: process.env.EXPO_PUBLIC_ENV,
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
      FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
  },
};
