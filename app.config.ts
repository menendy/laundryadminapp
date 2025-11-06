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
    },
  },
};
