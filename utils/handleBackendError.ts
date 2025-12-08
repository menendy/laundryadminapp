import axios from "axios";

/**
 * UNIVERSAL ERROR HANDLER
 */
export const handleBackendError = (
  input: any,
  setErrors: (e: any) => void,
  showSnackbar: (msg: string, type?: any) => void
) => {
  if (axios.isAxiosError(input)) {
    const err = input;

    if (!err.response) {
      showSnackbar("Tidak dapat terhubung ke server", "error");
      return false;
    }

    const { status, data } = err.response;

    // 1️⃣ PRIORITAS: FORM VALIDATION ERROR ARRAY
    if (status === 400 && Array.isArray(data?.errors)) {
      const formatted: Record<string, string> = {};
      data.errors.forEach((e: any) => {
        formatted[e.field] = e.message;
      });
      setErrors(formatted);
      showSnackbar("Lengkapi data dengan benar", "error");
      return false;
    }

    // 2️⃣ Single-field validation response in Axios
    if (status === 400 && data?.field && data?.message) {
      setErrors({ [data.field]: data.message });
      showSnackbar("Lengkapi data dengan benar", "error");
      return false;
    }

    if (data?.type === "info-blocking") {
      showSnackbar(data?.message || "Informasi", "info-blocking");
      return false;
    }

    if (status === 401) {
      showSnackbar("Akses ditolak. Anda tidak memiliki izin.", "error");
      return false;
    }

    if (status === 403) {
      showSnackbar("Anda tidak dapat mengakses fitur ini.", "error");
      return false;
    }

    showSnackbar(data?.message || "Terjadi kesalahan pada server.", "error");
    return false;
  }

  // ============ Non-Axios backend response ============

  const result = input;
  if (!result) {
    showSnackbar("Terjadi kesalahan server", "error");
    return false;
  }

  if (result.success) return true;

  // 1️⃣ PRIORITAS: ARRAY VALIDATION
  if (Array.isArray(result.errors)) {
    const formatted: Record<string, string> = {};
    result.errors.forEach((err: any) => {
      formatted[err.field] = err.message;
    });
    setErrors(formatted);
    showSnackbar("Lengkapi semua data dengan benar", "error");
    return false;
  }

  // 2️⃣ Single-field validation
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
