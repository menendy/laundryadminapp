// app/profil/index.tsx
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Avatar, List } from "react-native-paper";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getUserProfile } from "../../services/api/usersService";
import { handleBackendError } from "../../utils/handleBackendError";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useBasePath } from "../../utils/useBasePath";

// ✅ SATU-SATUNYA CARA LOGOUT
import { signOut } from "../../services/firebase";

interface RightValueProps {
  text: string;
  warning?: boolean;
}

type ProfileParams = {
  updatedField?: string;
  updatedValue?: string;
};

export default function ProfilAkun() {
  const router = useRouter();
  const params = useGlobalSearchParams<ProfileParams>();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const insets = useSafeAreaInsets();

  // 🔥 SAMA DENGAN KARYAWAN
  const { rootBase: rootPath, basePath } = useBasePath();

  const [profile, setProfile] = useState<any>({
    name: "-",
    email: "",
    phone: "",
    bio: "",
    gender: "",
    birthday: "",
    photo_url: null,
    outlet_default: null,
    address: "",
  });

  /* =========================
     UTIL
  ========================== */

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

  const RightValue: React.FC<RightValueProps> = ({
    text,
    warning = false,
  }) => (
    <View style={styles.rightContainer}>
      <Text style={warning ? styles.rightTextWarning : styles.rightText}>
        {text}
      </Text>
      <List.Icon icon="chevron-right" />
    </View>
  );

  /* =========================
     LOAD PROFILE (ONCE)
  ========================== */

  useEffect(() => {
    const load = async () => {
      const res = await getUserProfile();
      const success = handleBackendError(res, () => {}, showSnackbar);
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

  /* =========================
     REALTIME UPDATE (SAMA POLA KARYAWAN)
  ========================== */

  useEffect(() => {
    if (!params.updatedField) return;

    const f = params.updatedField;
    const v = params.updatedValue ?? "";

    if (f === "name") setProfile((p: any) => ({ ...p, name: v }));
    if (f === "phone") setProfile((p: any) => ({ ...p, phone: v }));
    if (f === "email") setProfile((p: any) => ({ ...p, email: v }));
    if (f === "address") setProfile((p: any) => ({ ...p, address: v }));
    if (f === "gender") setProfile((p: any) => ({ ...p, gender: v }));
    if (f === "birthday") setProfile((p: any) => ({ ...p, birthday: v }));

    if (f === "outlet_default") {
      try {
        const outlet = JSON.parse(v);
        setProfile((p: any) => ({ ...p, outlet_default: outlet }));
      } catch {
        console.warn("Invalid outlet_default param");
      }
    }

    // reset agar tidak trigger ulang
    router.setParams({
      updatedField: undefined,
      updatedValue: undefined,
    });
  }, [params.updatedField, params.updatedValue]);

  /* =========================
     UI
  ========================== */

  return (
    <View style={styles.container}>
      {/* ================= AVATAR ================= */}
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

      {/* ================= OUTLET ================= */}
      <View style={styles.sectionCard}>
        <List.Item
          title="Outlet Aktif"
          right={() => (
            <RightValue
              text={profile.outlet_default?.name || "Atur Sekarang"}
              warning={!profile.outlet_default}
            />
          )}
          onPress={() => router.push("/profil/editOutlet")}
        />
      </View>

      {/* ================= NAMA + ALAMAT ================= */}
      <View style={styles.sectionCard}>
        <List.Item
          title="Nama"
          right={() => <RightValue text={profile.name || "Atur Sekarang"} />}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                id: profile.uid,
                field: "name",
                label: "Nama",
                value: profile.name,
                rootPath,
                basePath,
              },
            })
          }
        />

        <View style={styles.divider} />

        <List.Item
          title="Alamat"
          right={() => (
            <RightValue text={profile.address || "Atur Sekarang"} />
          )}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "address",
                label: "Alamat",
                value: profile.address,
                rootPath,
                basePath,
              },
            })
          }
        />
      </View>

      {/* ================= GENDER + BIRTHDAY ================= */}
      <View style={styles.sectionCard}>
        <List.Item
          title="Jenis Kelamin"
          right={() => (
            <RightValue text={profile.gender || "Atur Sekarang"} />
          )}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "gender",
                label: "Jenis Kelamin",
                value: profile.gender,
                rootPath,
                basePath,
              },
            })
          }
        />

        <View style={styles.divider} />

        <List.Item
          title="Tanggal Lahir"
          right={() => (
            <RightValue text={profile.birthday || "Atur Sekarang"} />
          )}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "birthday",
                label: "Tanggal Lahir",
                value: profile.birthday,
                rootPath,
                basePath,
              },
            })
          }
        />
      </View>

      {/* ================= PHONE + EMAIL ================= */}
      <View style={styles.sectionCard}>
        <List.Item
          title="No. Handphone"
          right={() => (
            <RightValue
              text={maskPhone(profile.phone) || "Atur Sekarang"}
            />
          )}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "phone",
                label: "No. Handphone",
                value: profile.phone,
                rootPath,
                basePath,
              },
            })
          }
        />

        <View style={styles.divider} />

        <List.Item
          title="Email"
          right={() => (
            <RightValue
              text={maskEmail(profile.email) || "Atur Sekarang"}
            />
          )}
          onPress={() =>
            router.push({
              pathname: "/profil/modal/[field]",
              params: {
                field: "email",
                label: "Email",
                value: profile.email,
                rootPath,
                basePath,
              },
            })
          }
        />
      </View>

      {/* ================= LOGOUT ================= */}
      <List.Item
        title="Logout"
        left={() => <List.Icon icon="logout" />}
        onPress={async () => {
          try {
            await signOut();
          } catch (err) {
            console.warn("Logout error (ignored):", err);
          } finally {
            useAuthStore.getState().logout();
            router.replace("/auth/login");
          }
        }}
      />
    </View>
  );
}

/* ================= STYLES ================= */

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
