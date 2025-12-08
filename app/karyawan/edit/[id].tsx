import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, List, ActivityIndicator, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import { getMitraById, updateMitraV2 } from "../../../services/api/mitraService";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";
import { getRoleListLite } from "../../../services/api/rolesService";
import { useBasePath } from "../../../utils/useBasePath";

export default function EditKaryawanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const searchParams = useGlobalSearchParams();
  const id = params.id;
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const insets = useSafeAreaInsets();
  const { rootBase: rootPath, basePath } = useBasePath();
  const [hasRefreshed, setHasRefreshed] = useState(false);


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [active, setActive] = useState(true);
  const [assignRole, setAssignRole] = useState(false);
  const [roleId, setRoleId] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [data, setData] = useState<any>({
    name: "",
    alias: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadRoles = async () => {
    const res = await getRoleListLite();
    if (res.success) {
      setRoles(res.data.map((r: any) => ({ label: r.name, value: r.id })));
    }
  };

  const loadData = async () => {
    try {
      const res = await getMitraById(id as string, rootPath, basePath);

      setData({
        name: res.name,
        alias: res.alias,
        phone: res.phone?.replace(/^(\+62|62)/, ""),
        email: res.email,
        address: res.alamat,
      });
      setActive(res.active);

      if (res.role_ids?.length > 0) {
        setAssignRole(true);
        setRoleId(res.role_ids);
        await loadRoles();
      }
    } catch (err) {
      showSnackbar("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };


  // Fetch data pertama kali masuk halaman
  useEffect(() => {
    //console.log("INITIAL LOAD");
    loadData(); // 1x saja saat buka pertama kali
  }, [id]);

  // Reload data ketika kembali dari modal
  useFocusEffect(
    React.useCallback(() => {
      if (!loading) {
        //console.log("FOCUS REFRESH (modal return)");
        loadData(); // hanya reload ketika sudah tidak loading
      }
    }, [loading])
  );


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const section = (children: any) => (
    <View style={styles.sectionCard}>{children}</View>
  );

  const goEdit = (field: string, label: string, value: string) =>
    router.push({
      pathname: "/karyawan/edit2/modal/[field]",
      params: { id, field, label, value, rootPath, basePath },
    });

  return (
    <View style={styles.container}>
      <AppHeaderActions showBack title="Edit Karyawan" />

      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 100 }}>
        {/* STATUS */}
        {section(
          <>
            <Text style={styles.sectionTitle}>Status Akun</Text>
            <List.Item
              title="Aktifkan Akun"
              description={active ? "Aktif" : "Nonaktif"}
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemValue}
              right={() => <ToggleSwitch value={active} onChange={setActive} />}
            />
          </>
        )}

        {/* DATA PRIBADI */}
        {section(
          <>
            <Text style={styles.sectionTitle}>Data Pribadi</Text>
            {[
              ["name", "Nama Lengkap"],
              ["alias", "Nama Panggilan"],
              ["phone", "No. Handphone"],
              ["email", "Email"],
              ["address", "Alamat"],
            ].map(([field, label]) => (
              <>
                <List.Item
                  key={field}
                  title={label}
                  description={
                    field === "phone"
                      ? data[field]
                        ? `+62${data[field]}`
                        : "Atur Sekarang"
                      : data[field] || "Atur Sekarang"
                  }
                  titleStyle={styles.itemTitle}
                  descriptionStyle={styles.itemValue}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => goEdit(field, label, data[field])}
                />
                <View style={styles.divider} />
              </>
            ))}
          </>
        )}

        {/* ADMIN */}
        {section(
          <>
            <Text style={styles.sectionTitle}>Atur Akses Admin</Text>
            <List.Item
              title="Berikan akses admin"
              description={assignRole ? "Ya" : "Tidak"}
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemValue}
              right={() => <ToggleSwitch value={assignRole} onChange={setAssignRole} />}
            />

            {assignRole && (
              <>
                <View style={styles.divider} />
                <List.Item
                  title="Level Akses"
                  description={
                    roles.find((r) => r.value === roleId[0])?.label ||
                    "Pilih Level Akses"
                  }
                  titleStyle={styles.itemTitle}
                  descriptionStyle={styles.itemValue}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={async () => {
                    await loadRoles();
                    goEdit("role_ids", "Level Akses", roleId[0]);
                  }}
                />
              </>
            )}
          </>
        )}

       
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F4", paddingHorizontal: 16 },
  sectionCard: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 22, paddingHorizontal: 12, paddingTop: 14 },
  divider: { height: 1, backgroundColor: "#E6E6E6", marginLeft: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#555", marginBottom: 12 },
  itemTitle: { fontSize: 12, color: "#777" },
  itemValue: { fontSize: 15, fontWeight: "600", color: "#333" },
});
