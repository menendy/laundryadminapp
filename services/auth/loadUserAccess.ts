// services/auth/loadUserAccess.ts
import { jwtDecode } from "jwt-decode";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import { useAuthStore } from "../../store/useAuthStore";
import { useAccessStore } from "../../store/useAccessStore";

export async function loadUserAccessFromClaims(idToken: string) {
  if (!idToken) {
    console.log("❌ loadUserAccessFromClaims: empty token");
    return;
  }

  // 1️⃣ Decode JWT
  const decoded: any = jwtDecode(idToken);

  const roleIds: string[] = Array.isArray(decoded.role_ids) ? decoded.role_ids : [];
  const activeTenant = decoded.active_tenant || null;

  //console.log("🔥 Claims roleIds:", roleIds);
  console.log("🔥 Claims activeTenant:", activeTenant);

  // 2️⃣ Simpan ke AuthStore
  const authStore = useAuthStore.getState();
  authStore.setRoleIds(roleIds);
  authStore.setActiveTenant(activeTenant);

  // Jika tidak ada role → clear access
  if (!roleIds.length) {
    useAccessStore.getState().setAccess([], {});
    return;
  }

  // 3️⃣ Ambil detail role dari Firestore
  const pagesSet = new Set<string>();
  const permsByPage: Record<string, any> = {};

  for (const roleId of roleIds) {
    const snap = await getDoc(doc(db, "roles", roleId));
    if (!snap.exists()) continue;

    const data = snap.data();

    // pages[]
    (data.pages || []).forEach((p: string) => pagesSet.add(p));

    // permissions{}
    if (data.permissions) {
      Object.entries(data.permissions).forEach(([page, val]) => {
        permsByPage[page] = { ...(permsByPage[page] || {}), ...(val as any) };
      });
    }
  }

  // 4️⃣ Simpan hasil role-access ke Zustand
  useAccessStore.getState().setAccess(Array.from(pagesSet), permsByPage);

  //console.log("🔥 Loaded pages:", Array.from(pagesSet));
  //console.log("🔥 Loaded permissions:", permsByPage);
}
