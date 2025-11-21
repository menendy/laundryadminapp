// services/auth/loadUserAccess.ts
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../../store/useAuthStore";

export async function loadUserAccessFromClaims(idToken: string) {
  if (!idToken) return;

  const decoded: any = jwtDecode(idToken);

  const activeTenant = decoded.active_tenant || null;

  console.log("🔥 Claims activeTenant:", activeTenant);

  const authStore = useAuthStore.getState();
  authStore.setActiveTenant(activeTenant);
}
