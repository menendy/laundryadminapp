import { SnackbarType } from "../store/useSnackbarStore";

/**
 * Format respons backend baru (bisa multi-error)
 */
export interface BackendResponse {
  success?: boolean;
  id?: string;
  message?: string;
  status?: number;
  field?: string | null;
  errors?: { field: string | null; message: string }[];
}

/**
 * Handler error universal
 * - Menampilkan snackbar ringkas
 * - Menyebar error ke semua field dari array `errors`
 * - Mengembalikan true kalau aman lanjut ke proses sukses
 */
export const handleBackendError = <T extends BackendResponse>(
  result: T,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>,
  showSnackbar: (message: string, type?: SnackbarType) => void
): boolean => {
  // 🚫 Jika koneksi gagal
  if (result?.status === 0) {
    showSnackbar("❌ Tidak dapat terhubung ke server", "error");
    return false;
  }

  // 💡 Jika error (status >= 400)
  if (result?.status && result.status >= 400) {
    // jika backend kirim array errors
    if (Array.isArray(result.errors) && result.errors.length > 0) {
      const newErrors: Record<string, string> = {};

      for (const err of result.errors) {
        if (err.field) newErrors[err.field] = err.message;
      }

      // 🎯 tampilkan snackbar ringkas saja
      showSnackbar("❌ Input belum valid. Periksa kembali isian Anda.", "error");

      // set semua field error sekaligus
      setErrors(newErrors);
      return false;
    }

    // fallback: single error mode
    const field = result.field ?? null;
    const message = result.message ?? "Terjadi kesalahan pada server";

    showSnackbar(`❌ ${message}`, "error");
    if (field) setErrors((prev) => ({ ...prev, [field]: message }));
    return false;
  }

  // ✅ Aman, lanjutkan
  return true;
};
