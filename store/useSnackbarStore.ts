import { create } from "zustand";

type SnackbarType = "success" | "error" | "info" | "info-blocking";

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  persistent: boolean;
  showSnackbar: (message: string, type?: SnackbarType) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: "",
  type: "info",
  persistent: false,
  showSnackbar: (message, type = "info") =>
    set({
      visible: true,
      message,
      type,
      persistent: type === "info-blocking", // 👈 MAGIC!
    }),
  hideSnackbar: () =>
    set({
      visible: false,
      persistent: false,
    }),
}));
