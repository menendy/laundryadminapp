import { useEffect } from "react";
import { useAuthStore } from "./useAuthStore";

export function AuthHydrate() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(); // HARUS DIPANGGIL
  }, []);

  return null;
}
