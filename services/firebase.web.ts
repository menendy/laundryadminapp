// === Firebase Web (JS SDK) ===
console.log("🌐 firebase.web.ts (JS SDK) loaded");

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { firebaseConfig } from "./firebaseConfig";

// Inisialisasi aplikasinya
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export default firebase;
