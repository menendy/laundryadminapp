import { Platform } from "react-native";

let firebase;

if (Platform.OS === "web") {
  firebase = require("./firebase.web");
} else {
  firebase = require("./firebase.native");
}

export const auth = firebase.auth;
export const signInWithEmailAndPassword = firebase.signInWithEmailAndPassword;
export const getIdToken = firebase.getIdToken;
export const signOut = firebase.signOut;      // ⬅ TAMBAHKAN INI
