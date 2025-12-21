import { getApp } from "@react-native-firebase/app";
import auth,{ signOut } from "@react-native-firebase/auth";

const app = getApp();
export const firebaseAuth = auth(app);

export { auth, signOut };
