// services/firebase.native.ts
import {
  getAuth,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as sendPasswordResetEmailModular,
} from "@react-native-firebase/auth";

// ===============================
// 🔐 AUTH INSTANCE (MODULAR)
// ===============================
const authInstance = getAuth();

// ===============================
// 🔐 RESET PASSWORD (NATIVE / MODULAR)
// ===============================
const sendPasswordResetEmail = async (_auth: any, email: string) => {
  // _auth diabaikan → konsisten dengan web
  return sendPasswordResetEmailModular(authInstance, email);
};

// ===============================
// ⬇️ EXPORT (COMPATIBLE)
// ===============================
module.exports = {
  auth: authInstance,
  signOut: () => firebaseSignOut(authInstance),
  sendPasswordResetEmail,
};
