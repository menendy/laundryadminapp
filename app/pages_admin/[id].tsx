import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Chip } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeaderActions from "../../components/ui/AppHeaderActions";
import { getPageAdminById } from "../../services/api/pagesAdminService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function PageAdminDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPageAdminById(String(id));
      const ok = handleBackendError(res, () => {}, showSnackbar);
      if (!ok) return;
      setData(res.data);
    } catch (err) {
      console.error("🔥 Error load detail:", err);
      handleBackendError(err, () => {}, showSnackbar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Data tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Detail Halaman" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Title + Edit Icon */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {data.name}
          </Text>

          {/* Edit Icon Button */}
          <TouchableOpacity style={{ paddingRight: 16 }}
            onPress={() => router.push(`/pages_admin/edit/${id}`)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil-sharp" size={24} color="#258bf9ff" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
          Path: {data.path}
        </Text>

        <Text style={{ fontSize: 14, color: "#555", marginBottom: 5 }}>
          Component: {data.component}
        </Text>

        {/* STATUS */}
       {/* STATUS */}
            <Text style={{ marginTop: 20, fontWeight: "700" }}>
            Status Halaman
            </Text>

            <Text
            style={{
                marginTop: 8,
                fontSize: 15,
                fontWeight: "700",
                color: data.active ? "#2e7d32" : "#c62828",
            }}
            >
            {data.active ? "Aktif" : "Tidak Aktif"}
            </Text>


        {/* Permission */}
        <Text style={{ marginTop: 20, fontWeight: "700" }}>
          Permission Type
        </Text>

        {data.permissions_type ? (
          Object.entries(data.permissions_type).map(([url, perm]: any, i) => (
            <View
              key={i}
              style={{
                paddingVertical: 5,
                borderBottomWidth: 1,
                borderColor: "#eee",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: "600" }}>{url}</Text>
              <Text>{perm}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#777" }}>Tidak ada data permission</Text>
        )}
      </ScrollView>
    </View>
  );
}
