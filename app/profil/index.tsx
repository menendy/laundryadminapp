// app/profil/index.tsx
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native"; 
import { Text, Avatar, List } from "react-native-paper";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getUserProfile } from "../../services/api/usersService";
import { handleBackendError } from "../../utils/handleBackendError";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useBasePath } from "../../utils/useBasePath";
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
  const insets = useSafeAreaInsets(); // ✅ Mengambil data safe area (notch/status bar)

  const { rootBase: rootPath, basePath } = useBasePath();

  const [profile, setProfile] = useState<any>({
    uid: "",
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

  const getInitials = (fullName: string) =>
    fullName?.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";

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

  const formatDateID = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${parts[2]} ${monthNames[parseInt(parts[1], 10) - 1] || parts[1]} ${parts[0]}`;
  };

  const RightValue: React.FC<RightValueProps> = ({ text, warning = false }) => (
    <View style={styles.rightContainer}>
      <Text 
        numberOfLines={1} 
        ellipsizeMode="tail"
        style={[warning ? styles.rightTextWarning : styles.rightText, { maxWidth: Dimensions.get('window').width * 0.4 }]}
      >
        {text}
      </Text>
      <List.Icon icon="chevron-right" />
    </View>
  );

  useEffect(() => {
    const load = async () => {
      const res = await getUserProfile();
      const success = handleBackendError(res, () => {}, showSnackbar);
      if (!success) return;
      if (res.profile) {
        setProfile({
          ...res.profile,
          address: res.profile.alamat, 
          outlet_default: res.outlet_default ?? null,
        });
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!params.updatedField) return;
    const f = params.updatedField;
    const v = params.updatedValue ?? "";
    const fields: any = { name: 'name', phone: 'phone', email: 'email', address: 'address', gender: 'gender', birthday: 'birthday' };
    if (fields[f]) setProfile((p: any) => ({ ...p, [fields[f]]: v }));
    if (f === "outlet_default") {
      try { setProfile((p: any) => ({ ...p, outlet_default: JSON.parse(v) })); } catch { console.warn("Invalid outlet_default"); }
    }
    router.setParams({ updatedField: undefined, updatedValue: undefined });
  }, [params.updatedField, params.updatedValue]);

  return (
    <ScrollView 
      style={styles.container}
      // ✅ Gunakan contentContainerStyle untuk padding dinamis
      contentContainerStyle={{
        paddingTop: insets.top + 10, // Menyesuaikan notch/status bar + margin kecil
        paddingBottom: insets.bottom + 100, // Ruang untuk Bottom Nav agar tidak tertutup
        paddingHorizontal: 16,
      }}
    >
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
            <RightValue text={profile.outlet_default?.name || "Atur Sekarang"} warning={!profile.outlet_default} />
          )}
          onPress={() => router.push("/profil/editOutlet")}
        />
      </View>

      {/* ================= NAMA + ALAMAT ================= */}
      <View style={styles.sectionCard}>
        <List.Item
          title="Nama"
          right={() => <RightValue text={profile.name || "Atur Sekarang"} />}
          onPress={() => router.push({ pathname: "/profil/modal/[field]", params: { id: profile.uid, field: "name", label: "Nama", value: profile.name, rootPath, basePath } })}
        />
        <View style={styles.divider} />
        <List.Item
          title="Alamat"
          right={() => <RightValue text={profile.address || "Atur Sekarang"} />}
          onPress={() => router.push({ pathname: "/profil/modal/[field]", params: { id: profile.uid, field: "address", label: "Alamat", value: profile.address, rootPath, basePath } })}
        />
      </View>

      {/* ================= GENDER + BIRTHDAY ================= */}
      <View style={styles.sectionCard}>
        <List.Item
          title="Jenis Kelamin"
          right={() => <RightValue text={profile.gender || "Atur Sekarang"} />}
          onPress={() => router.push({ pathname: "/profil/modal/[field]", params: { id: profile.uid, field: "gender", label: "Jenis Kelamin", value: profile.gender, rootPath, basePath } })}
        />
        <View style={styles.divider} />
        <List.Item
          title="Tanggal Lahir"
          right={() => <RightValue text={formatDateID(profile.birthday) || "Atur Sekarang"} />}
          onPress={() => router.push({ pathname: "/profil/modal/[field]", params: { id: profile.uid, field: "birthday", label: "Tanggal Lahir", value: profile.birthday, rootPath, basePath } })}
        />
      </View>

      {/* ================= PHONE + EMAIL ================= */}
      <View style={styles.sectionCard}>
        <List.Item
          title="No. Handphone"
          right={() => <RightValue text={maskPhone(profile.phone) || "Atur Sekarang"} />}
          onPress={() => router.push({ pathname: "/profil/modal/[field]", params: { id: profile.uid, field: "phone", label: "No. Handphone", value: profile.phone, rootPath, basePath } })}
        />
        <View style={styles.divider} />
        <List.Item
          title="Email"
          right={() => <RightValue text={maskEmail(profile.email) || "Atur Sekarang"} />}
          onPress={() => router.push({ pathname: "/profil/modal/[field]", params: { id: profile.uid, field: "email", label: "Email", value: profile.email, rootPath, basePath } })}
        />
      </View>

      {/* ================= LOGOUT ================= */}
      <List.Item
        title="Logout"
        left={() => <List.Icon icon="logout" />}
        onPress={async () => {
          try { await signOut(); } catch (err) { console.warn("Logout error:", err); } finally {
            useAuthStore.getState().logout();
            router.replace("/auth/login");
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8, // Margin dikurangi karena sudah ada insets.top
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
    marginBottom: 20,
    paddingLeft: 4,
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