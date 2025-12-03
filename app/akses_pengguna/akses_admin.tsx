import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { Checkbox, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import AppHeaderActions from "../../components/ui/AppHeaderActions";
import { getPagesAdminListAll, getAksesPenggunaById } from "../../services/api/aksesPenggunaService";
import { extractPermissionTypes } from "../../utils/permissionsHelper";
import { useRolePermissionStore } from "../../store/useRolePermissionStore";
import { useBasePath } from "../../utils/useBasePath";

export default function AksesHalamanAdminScreen() {

  const router = useRouter();
  const { roleId } = useLocalSearchParams(); // 🔥 detect Edit Mode

  const { rootBase: rootPath, basePath } = useBasePath();

  const permissions = useRolePermissionStore((s) => s.permissions);
  const setPermission = useRolePermissionStore((s) => s.setPermission);
  const setPermissions = useRolePermissionStore((s) => s.setPermissions);
 

  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingPerm, setLoadingPerm] = useState(true);
  const pathname = usePathname();
   

  // 🔥 PRELOAD EXISTING PERMISSIONS (EDIT MODE ONLY)
  const preloadPermissions = async () => {
  if (!roleId) {
    setLoadingPerm(false);
    return;
  }

  // 🔥 if store already has data → DO NOT override
  if (Object.keys(permissions).length > 0) {
    console.log("⚠️ Skip preload, use existing store state");
    setLoadingPerm(false);
    return;
  }

  try {
    console.log("🔍 Preload from server:", roleId);
    const result = await getAksesPenggunaById(String(roleId),rootPath,basePath);
    const perms = result?.permissions ?? [];

    const mapped: Record<string, string[]> = {};
    perms.forEach((p: any) => {
      mapped[p.page_id] = p.actions ?? [];
    });

    setPermissions(mapped);

    console.log("🔥 Preloaded:", mapped);
  } catch (err) {
    console.error("🔥 preload error:", err);
  } finally {
    setLoadingPerm(false);
  }
};

  // 🔥 LOAD PAGES AFTER PERMISSION LOADED
  const loadPages = async () => {
    try {
      const data = await getPagesAdminListAll();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("🔥 load pages error:", err);
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    preloadPermissions().then(() => {
      loadPages();
    });
  }, []);

  const togglePermission = (pageId: string, action: string) => {
    const prev = permissions[pageId] ?? [];
    const updated = prev.includes(action)
      ? prev.filter((x) => x !== action)
      : [...prev, action];

    setPermission(pageId, updated);
  };

  // LOADING STATE — HARUS TUNGGU KEDUA PROSES SELESAI
  if (loadingPages || loadingPerm) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Memuat Data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Atur Halaman Admin" showBack />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {pages.map((pg: any) => {
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
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ textTransform: "capitalize", fontSize: 14 }}>
                        {action}
                      </Text>

                      <Checkbox
                        status={selectedActions.includes(action) ? "checked" : "unchecked"}
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
          onPress={() => {
            console.log("✔ Permissions state:", permissions);
            router.back();
          }}
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
