// services/firebase.web.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);

// Web instances
export const authWeb = getAuth(app);
export const dbWeb = getFirestore(app);
