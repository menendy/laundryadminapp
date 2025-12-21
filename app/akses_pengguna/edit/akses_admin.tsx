import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { Checkbox, Button, Searchbar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import AppHeaderActions from "../../../components/ui/AppHeaderActions";

import {
  getPagesAdminListAll,
  getAksesPenggunaById,
} from "../../../services/api/aksesPenggunaService";

import { extractPermissionTypes } from "../../../utils/permissionsHelper";
import { useRolePermissionStore } from "../../../store/useRolePermissionStore";
import { useSimpleListSearch } from "../../../hooks/useSimpleListSearch";

export default function AksesHalamanAdminScreen() {
  const router = useRouter();
  const { roleId } = useLocalSearchParams();
  const params = useLocalSearchParams<any>();

  const rootPath = params.rootPath;
  const basePath = params.basePath;

  const permissions = useRolePermissionStore((s) => s.permissions);
  const setPermission = useRolePermissionStore((s) => s.setPermission);
  const setPermissions = useRolePermissionStore((s) => s.setPermissions);

  const [loadingPerm, setLoadingPerm] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true); // ⬅️ Tambahkan ini

  // ======================================================
  // 🔥 useSimpleListSearch → untuk search halaman admin
  // ======================================================
  const list = useSimpleListSearch<any>({
    rootPath,
    basePath,
    fetchFn: getPagesAdminListAll,
    limit: 50,
  
  });

  // Matikan loading initial ketika data pertama sudah masuk
  useEffect(() => {
    if (!list.loading && list.items.length >= 0) {
      // Tidak harus > 0, karena bisa saja hasil search kosong
      setLoadingInitial(false);
    }
  }, [list.loading]);

  // ======================================================
  // 🔥 PRELOAD EXISTING ROLE PERMISSIONS
  // ======================================================
  const preloadPermissions = async () => {
    if (!roleId) {
      setLoadingPerm(false);
      return;
    }

    if (Object.keys(permissions).length > 0) {
      setLoadingPerm(false);
      return;
    }

    try {
      const result = await getAksesPenggunaById(String(roleId), rootPath, basePath);
      const perms = result?.permissions ?? [];

      const mapped: Record<string, string[]> = {};
      perms.forEach((p: any) => {
        mapped[p.page_id] = p.actions ?? [];
      });

      setPermissions(mapped);
    } catch (err) {
      console.error("🔥 preload error:", err);
    } finally {
      setLoadingPerm(false);
    }
  };

  useEffect(() => {
    preloadPermissions();
  }, []);

  // ======================================================
  // 🔄 Toggle permission
  // ======================================================
  const togglePermission = (pageId: string, action: string) => {
    const prev = permissions[pageId] ?? [];
    const updated = prev.includes(action)
      ? prev.filter((x) => x !== action)
      : [...prev, action];

    setPermission(pageId, updated);
  };

  // ======================================================
  // ⏳ LOADING STATE (preload + initial load)
  // ======================================================
  if (loadingPerm || loadingInitial) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Memuat data...</Text>
      </View>
    );
  }

  // ======================================================
  // ✨ UI
  // ======================================================
  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Atur Halaman Admin" showBack />

      {/* 🔍 Search bar */}
      <Searchbar
        placeholder="Cari halaman..."
        value={list.search}
        onChangeText={list.setSearch}
        clearIcon="close"
        onIconPress={() => list.setSearch("")}
        style={{
          marginHorizontal: 16,
          marginTop: 14,
          marginBottom: 10,
      
        }}
     
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {list.items.map((pg: any) => {
          const pagePerms = extractPermissionTypes(pg.permissions_type ?? {});
          const selectedActions = permissions[pg.id] ?? [];

          return (
            <View
              key={pg.id}
              style={{
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 8,
                borderColor: "#ddd",
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", marginBottom: 12 }}>
                {pg.name}
              </Text>

              {pagePerms.length === 0 ? (
                <Text style={{ fontStyle: "italic", color: "#666" }}>
                  Tidak ada permission
                </Text>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                  {pagePerms.map((action: string) => (
                    <View
                      key={action}
                      style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                    >
                      <Text style={{ textTransform: "capitalize", fontSize: 14 }}>
                        {action}
                      </Text>

                      <Checkbox
                        status={
                          selectedActions.includes(action) ? "checked" : "unchecked"
                        }
                        onPress={() => togglePermission(pg.id, action)}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <Button
          mode="contained"
          onPress={() => router.back()}
          style={{ marginTop: 30 }}
        >
          Simpan
        </Button>

        <Button onPress={() => router.back()} style={{ marginTop: 10 }}>
          Batal
        </Button>
      </ScrollView>
    </View>
  );
}
