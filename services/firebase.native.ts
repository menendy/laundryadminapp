// services/firebase.native.ts
import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  getIdToken,
  signOut,
} from "@react-native-firebase/auth";

const app = getApp();
export const auth = getAuth(app);

export {
  signInWithEmailAndPassword,
  getIdToken,
  signOut,
};
