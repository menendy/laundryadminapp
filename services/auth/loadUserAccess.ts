console.log("🔥 FILE loadUserAccess.ts LOADED");
// services/auth/loadUserAccess.ts
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { useAuthStore } from "../../store/useAuthStore";
import { useAccessStore } from "../../store/useAccessStore";
import { doc, getDoc } from "firebase/firestore";

/**
 * Membaca ulang custom claims, 
 * ambil roleIds, fetch roles dari Firestore,
 * lalu simpan ke Zustand.
 */
export async function loadUserAccessFromClaims() {
  const auth = getAuth();
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) return;

  // =========================================
  // 1) Ambil custom claims
  // =========================================
  const tokenResult = await firebaseUser.getIdTokenResult(true);
  const claims = tokenResult.claims || {};
  const roleIds = Array.isArray(claims.role_ids) ? claims.role_ids as string[] : [];

  console.log("Loaded role IDs from claims:", roleIds);

  useAuthStore.getState().setRoleIds(roleIds);

  // =========================================
  // 2) Fetch detail role dari Firestore
  // =========================================
  const pagesSet = new Set<string>();
  const permsByPage: Record<string, any> = {};

  for (const roleId of roleIds) {
    const snap = await getDoc(doc(db, "roles", roleId));
    if (!snap.exists()) continue;

    const data = snap.data();

    // Add pages
    (data.pages || []).forEach((p: string) => pagesSet.add(p));

    // Merge permissions
    if (data.permissions) {
      Object.entries(data.permissions).forEach(([p, val]) => {
        permsByPage[p] = { ...(permsByPage[p] || {}), ...(val as any) };
      });
    }
  }

  // =========================================
  // 3) Simpan ke Zustand
  // =========================================
  useAccessStore.getState().setAccess(
    Array.from(pagesSet),
    permsByPage
  );
}
