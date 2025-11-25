// services/firebase.web.ts
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  getIdToken,
  signOut,
} from "firebase/auth";

import { firebaseConfig } from "./firebaseConfig";

let app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export {
  signInWithEmailAndPassword,
  getIdToken,
  signOut,
};
