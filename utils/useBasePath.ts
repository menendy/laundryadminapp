import { useSegments } from "expo-router";

/**
 * Helper RBAC Path Resolver (UNIFIED)
 * - basePath → full static segments (akses_pengguna/edit)
 * - rootBase → folder utama (akses_pengguna)
 * - dynamic params otomatis diabaikan
 */
export function useBasePath() {
  const segments = useSegments(); // contoh: ["akses_pengguna", "edit", "[id]"]

  // Hanya include segmen static (tidak mengandung [])
  const staticSegments = segments.filter(seg => !seg.startsWith("["));

  // Base path untuk halaman spesifik (read/edit/delete UI)
  const basePath = "/" + staticSegments.join("/");

  // Base path untuk halaman utama / landing RBAC
  const rootBase = staticSegments.length > 0
    ? "/" + staticSegments[0]
    : "/";

  return {
    basePath,     // contoh: "/akses_pengguna/edit"
    rootBase,     // contoh: "/akses_pengguna"
    segments,
    fullPathSegments: segments, // debugging
  };
}
