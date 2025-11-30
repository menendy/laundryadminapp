import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Text, Avatar, Button } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";
import { signOut, auth } from "../../services/firebase";
import { getUserProfile } from "../../services/api/usersService";
import { handleBackendError } from "../../utils/handleBackendError";
import { useSnackbarStore } from "../../store/useSnackbarStore";

export default function ProfilAkun() {
  const router = useRouter();
  const pathname = usePathname();

  const [name, setName] = useState("Loading...");
  const [email, setEmail] = useState("");

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getUserProfile("profil", pathname); // ⬅ modul + path dikirim ke backend

        const success = handleBackendError(res, () => { }, showSnackbar);
        if (!success) return;

        if (res.profile) {
          setName(res.profile.name ?? "-");
          setEmail(res.profile.email ?? "-");
        }
      } catch (err: any) {
        handleBackendError(err, () => { }, showSnackbar);
      }
    };

    loadProfile();
  }, []); // ⬅ reload jika pindah tenant/page

  const getInitials = (fullName: string) =>
    fullName
      ?.trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  return (
    <View style={{ padding: 16, alignItems: "center" }}>
      <Avatar.Text label={getInitials(name)} size={72} />

      <Text variant="titleLarge" style={{ marginTop: 12 }}>
        {name}
      </Text>

      {email ? <Text variant="bodyMedium">{email}</Text> : null}

      <Button mode="contained" onPress={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </Button>
    </View>
  );
}
