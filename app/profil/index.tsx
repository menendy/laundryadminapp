import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Avatar, List } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";
import { getUserProfile } from "../../services/api/usersService";
import { handleBackendError } from "../../utils/handleBackendError";
import { useSnackbarStore } from "../../store/useSnackbarStore";
//import { signOut, auth } from "../../services/firebase";
import { Platform } from "react-native";

// WEB
import { auth as webAuth } from "../../services/firebase.web";

// NATIVE
import authNative from "@react-native-firebase/auth";

import { useAuthStore } from "../../store/useAuthStore";


interface RightValueProps {
  text: string;
  warning?: boolean;
}

export default function ProfilAkun() {
  const router = useRouter();
  const pathname = usePathname();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [profile, setProfile] = useState<any>({
    name: "-",
    email: "",
    phone: "",
    bio: "",
    gender: "",
    birthday: "",
    photo_url: null,
    outlet_default: null,
  });



  const getInitials = (fullName: string) =>
    fullName
      ?.trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const maskEmail = (email: string) => {
    if (!email) return "";
    const idx = email.indexOf("@");
    if (idx <= 1) return email;
    return email[0] + "******" + email.slice(idx - 1);
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "";
    const len = phone.length;
    return "*".repeat(len - 2) + phone.slice(len - 2);
  };

  const RightValue: React.FC<RightValueProps> = ({ text, warning = false }) => (
    <View style={styles.rightContainer}>
      <Text style={warning ? styles.rightTextWarning : styles.rightText}>
        {text}
      </Text>
      <List.Icon icon="chevron-right" />
    </View>
  );

  useEffect(() => {
    const load = async () => {
      const res = await getUserProfile();
      const success = handleBackendError(res, () => { }, showSnackbar);
      if (!success) return;
      if (res.profile) {
        setProfile({
          ...res.profile,
          outlet_default: res.outlet_default ?? null,
        });
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      {/* AVATAR SECTION */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => router.push("/profil/ubahFoto")}>
          {profile.photo_url ? (
            <Avatar.Image source={{ uri: profile.photo_url }} size={90} />
          ) : (
            <Avatar.Text label={getInitials(profile.name)} size={90} />
          )}
        </TouchableOpacity>
        <Text style={styles.editPhotoText}>Ubah</Text>
      </View>


      {/* SECTION 1 → OUTLET */}
      <View style={styles.sectionCard}>
        <List.Item
          title="Outlet"
          right={() => (
            <RightValue
              text={profile.outlet_default?.name || "Atur Sekarang"}
              warning={!profile.outlet_default}
            />
          )}
          onPress={() => router.push("/profil/editOutlet")}
          android_ripple={{ color: "transparent" }}
        />
      </View>



      {/* SECTION 1 → Nama + Bio */}
      <View style={styles.sectionCard}>

        <List.Item
          title="Nama"
          right={() => <RightValue text={profile.name || "Atur Sekarang"} />}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "name",
                label: "Nama",
                value: profile.name,
              },
            })
          }
        />

        <View style={styles.divider} />

        <List.Item
          title="Alamat"
          right={() => <RightValue text={profile.address || "Atur Sekarang"} />}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "address",
                label: "Alamat",
                value: profile.address,
              },
            })
          }
        />

      </View>

      {/* SECTION 2 → Jenis Kelamin + Tanggal Lahir */}
      <View style={styles.sectionCard}>
        <List.Item
          title=" Jenis Kelamin"
          right={() => <RightValue text={profile.address || "Atur Sekarang"} />}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "gender",
                label: "Jenis Kelamin",
                value: profile.gender,
              },
            })
          }
        />

        <View style={styles.divider} />

        <List.Item
          title=" Tanggal Lahir"
          right={() => <RightValue text={profile.birthday || "Atur Sekarang"} />}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "birthday",
                label: "Tanggal Lahir",
                value: profile.birthday,
              },
            })
          }
        />

      </View>

      {/* SECTION 3 → HP + Email */}
      <View style={styles.sectionCard}>
        <List.Item
          title="No. Handphone"
          right={() => <RightValue text={maskPhone(profile.phone) || "Atur Sekarang"} />}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "phone",
                label: "No. Handphone",
                value: profile.phone,
              },
            })
          }
        />


        <View style={styles.divider} />

        <List.Item
          title="Email"
          right={() => <RightValue text={maskEmail(profile.email) || "Atur Sekarang"} />}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "email",
                label: "email",
                value: profile.email,
              },
            })
          }
        />


      </View>

      {/* Logout tanpa arrow */}
      <List.Item
        title="Logout"
        left={() => <List.Icon icon="logout" />}
        onPress={async () => {
          try {
            if (Platform.OS === "web") {
              await webAuth.signOut();
            } else {
              await authNative().signOut(); // ✅ INI WAJIB DI MOBILE
            }
          } catch (err) {
            console.warn("Logout error (ignored):", err);
          } finally {
            // bersihkan store APAPUN yang terjadi
            useAuthStore.getState().logout();
            router.replace("/auth/login");
          }
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  editPhotoText: {
    marginTop: 6,
    color: "#FF5722",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 22,
    paddingLeft: 12,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6E6E6",
    marginLeft: 16,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rightText: {
    color: "#555",
    fontWeight: "500",
  },
  rightTextWarning: {
    color: "#E53935",
    fontWeight: "500",
  },
});
