// services/auth/tokenService.ts
import { Storage } from "../../store/storage";

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

// Simpan
export async function saveTokens(idToken: string, refreshToken: string) {
  await Storage.setItem("id-token", idToken);
  await Storage.setItem("refresh-token", refreshToken);
}

// Ambil
export async function loadTokens() {
  return {
    idToken: await Storage.getItem("id-token"),
    refreshToken: await Storage.getItem("refresh-token"),
  };
}

// Hapus
export async function clearTokens() {
  await Storage.removeItem("id-token");
  await Storage.removeItem("refresh-token");
}

export async function refreshFirebaseToken(refreshToken: string) {
  try {
    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    return {
      idToken: data.id_token,
      refreshToken: data.refresh_token,
    };
  } catch (err) {
    console.error("refreshFirebaseToken ERROR:", err);
    return null;
  }
}
