import axios from "axios";

export const handleBackendError = (
  input: any,
  setErrors: (e: any) => void,
  showSnackbar: (msg: string, type?: any) => void
) => {
  // ============ AXIOS ERROR ============
  if (axios.isAxiosError(input)) {
    const err = input;

    if (!err.response) {
      showSnackbar("Tidak dapat terhubung ke server", "error");
      return false;
    }

    const { status, data } = err.response;

    // 🔥 PERUBAHAN DISINI:
    // Tangkap 401 & 403, lalu ambil 'data.message' dari API.
    // Jika API mengirim: {"message": "Halaman tidak aktif"}, maka itu yang muncul.
    if (status === 401 || status === 403) {
      const apiMessage = data?.message || "Akses ditolak";
      showSnackbar(apiMessage, "error");
      return false;
    }

    // 1. Form Validation Error (400)
    if (status === 400 && Array.isArray(data?.errors)) {
      const formatted: Record<string, string> = {};
      data.errors.forEach((e: any) => {
        formatted[e.field] = e.message;
      });
      setErrors(formatted);
      showSnackbar("Lengkapi data dengan benar", "error");
      return false;
    }

    if (status === 400 && data?.field && data?.message) {
      setErrors({ [data.field]: data.message });
      showSnackbar("Lengkapi data dengan benar", "error");
      return false;
    }

    if (data?.type === "info-blocking") {
      showSnackbar(data?.message || "Informasi", "info-blocking");
      return false;
    }

    showSnackbar(data?.message || "Terjadi kesalahan pada server.", "error");
    return false;
  }

  // ============ NON-AXIOS (STANDARD RESPONSE) ============
  const result = input;
  if (!result) {
    showSnackbar("Terjadi kesalahan server", "error");
    return false;
  }

  if (result.success) return true;

  // 🔥 PERUBAHAN DISINI JUGA (Untuk respon sukses:false tapi status 403)
  if (result.status === 401 || result.status === 403) {
     const apiMessage = result.message || "Akses ditolak";
     showSnackbar(apiMessage, "error");
     return false;
  }

  // Validasi Array
  if (Array.isArray(result.errors)) {
    const formatted: Record<string, string> = {};
    result.errors.forEach((err: any) => {
      formatted[err.field] = err.message;
    });
    setErrors(formatted);
    showSnackbar("Lengkapi semua data dengan benar", "error");
    return false;
  }

  if (result?.field && result?.message) {
    setErrors({ [result.field]: result.message });
    showSnackbar("Lengkapi data dengan benar", "error");
    return false;
  }

  if (result?.type === "info-blocking") {
    showSnackbar(result.message || "Informasi", "info-blocking");
    return false;
  }

  if (result.message) {
    showSnackbar(result.message, "error");
    return false;
  }

  showSnackbar("Terjadi kesalahan server", "error");
  return false;
};