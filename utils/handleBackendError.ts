export function handleBackendError(
  result: any,
  setErrors: (e: any) => void,
  showSnackbar: (msg: string, type?: any) => void
) {
  if (!result) {
    showSnackbar("Terjadi kesalahan server", "error");
    return false;
  }

  if (result.success) return true;

  if (Array.isArray(result.errors)) {
    const formatted: Record<string, string> = {};

    result.errors.forEach((err: any) => {
      if (!formatted[err.field]) {
        formatted[err.field] = err.message;
      }
    });

    setErrors(formatted);

    // snackbar general
    showSnackbar("Lengkapi semua data dengan benar", "error");
    return false;
  }

  if (result.message) {
    showSnackbar("Terjadi kesalahan. Coba lagi.", "error");
    return false;
  }

  showSnackbar("Terjadi kesalahan server", "error");
  return false;
}
