import axios from "axios";

/**
 * UNIVERSAL ERROR HANDLER
 */
export const handleBackendError = (
  input: any,
  setErrors: (e: any) => void,
  showSnackbar: (msg: string, type?: any) => void
) => {
  //console.log("🔥 handleBackendError input:", input);

  if (axios.isAxiosError(input)) {
    const err = input;

    if (!err.response) {
      showSnackbar(
        "Tidak dapat terhubung ke server",
        "error"
      );
      return false;
    }

    const { status, data } = err.response;

    if (status === 400 && Array.isArray(data?.errors)) {
      const formatted: Record<string, string> = {};

      data.errors.forEach((e: any) => {
        if (!formatted[e.field]) formatted[e.field] = e.message;
      });

      setErrors(formatted);
      showSnackbar("Lengkapi data dengan benar", "error");
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

  // ======= Backend response biasa =======
  const result = input;

  if (!result) {
    showSnackbar("Terjadi kesalahan server", "error");
    return false;
  }

  if (result.success) return true;

  if (Array.isArray(result.errors)) {
    const formatted: Record<string, string> = {};

    result.errors.forEach((err: any) => {
      if (!formatted[err.field]) formatted[err.field] = err.message;
    });

    setErrors(formatted);
    showSnackbar("Lengkapi semua data dengan benar", "error");
    return false;
  }

  if (result.message) {
    showSnackbar(result.message, "error");
    return false;
  }

  showSnackbar("Terjadi kesalahan server", "error");
  return false;
};
