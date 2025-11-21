import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";  // sesuaikan path Firebase App Anda

const db = getFirestore(app);

export async function fetchRoleTypes() {
  const colRef = collection(db, "roles_type");
  const snap = await getDocs(colRef);

  const list: { id: string; label: string }[] = [];

  snap.forEach((doc) => {
    const data = doc.data();
    list.push({
      id: doc.id,
      label: data.label ?? doc.id,
    });
  });

  return list;
}
