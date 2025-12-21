import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";
import { Button, Checkbox, IconButton, Searchbar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import {
  getPagesAdminListAll,
  getAksesPenggunaById,
  updateAksesPengguna,
  PermissionItem,
} from "../../../../services/api/aksesPenggunaService";

import { extractPermissionTypes } from "../../../../utils/permissionsHelper";
import { useSimpleListSearch } from "../../../../hooks/useSimpleListSearch";
import { useSnackbarStore } from "../../../../store/useSnackbarStore";
import { handleBackendError } from "../../../../utils/handleBackendError";
import { modalStyles } from "../../../../styles/modalStyles";

/* ======================================================
   SCREEN
====================================================== */
export default function AksesHalamanAdminModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const insets = useSafeAreaInsets();

  const roleId = params.roleId;
  const rootPath = params.rootPath;
  const basePath = params.basePath;

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  /* ======================================================
     STATE
  ====================================================== */
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [loadingPerm, setLoadingPerm] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [visible] = useState(true);

  /* ======================================================
     LIST HALAMAN ADMIN
  ====================================================== */
  const list = useSimpleListSearch<any>({
    rootPath,
    basePath,
    fetchFn: getPagesAdminListAll,
    limit: 50,
  });

  useEffect(() => {
    if (!list.loading) setLoadingInitial(false);
  }, [list.loading]);

  /* ======================================================
     PRELOAD PERMISSION ROLE
  ====================================================== */
  useEffect(() => {
    const preload = async () => {
      if (!roleId) {
        setLoadingPerm(false);
        return;
      }

      try {
        const res = await getAksesPenggunaById(
          String(roleId),
          rootPath,
          basePath
        );

        const mapped: Record<string, string[]> = {};
        (res?.permissions ?? []).forEach((p: any) => {
          mapped[p.page_id] = p.actions ?? [];
        });

        setPermissions(mapped);
      } catch (err) {
        showSnackbar("Gagal memuat permission", "error");
      } finally {
        setLoadingPerm(false);
      }
    };

    preload();
  }, []);

  /* ======================================================
     TOGGLE PERMISSION
  ====================================================== */
  const togglePermission = (pageId: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[pageId] ?? [];
      const updated = current.includes(action)
        ? current.filter((x) => x !== action)
        : [...current, action];

      return { ...prev, [pageId]: updated };
    });
  };

  /* ======================================================
     SAVE
  ====================================================== */
  const handleSave = async () => {
    try {
      setSaving(true);

      const formatted: PermissionItem[] = Object.entries(permissions).map(
        ([page_id, actions]) => ({ page_id, actions })
      );

      const payload = {
        permissions: formatted,
        rootPath,
        basePath,
      };

      const res = await updateAksesPengguna(String(roleId), payload);
      const ok = handleBackendError(res, () => {}, showSnackbar);
      if (!ok) return;

      showSnackbar("Akses admin berhasil diperbarui", "success");
      close();
    } catch (err) {
      handleBackendError(err, () => {}, showSnackbar);
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     MODAL ANIMATION
  ====================================================== */
  const overlayOpacity = useSharedValue(0);
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const close = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => router.back(), 200);
  };

  /* ======================================================
     LOADING (MODAL ONLY)
  ====================================================== */
  if (loadingPerm || loadingInitial) {
    return (
      <Modal isVisible={visible} style={{ margin: 0 }} backdropOpacity={0}>
        <SafeAreaView
          style={[
            modalStyles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator />
          <Text style={{ marginTop: 10 }}>Memuat data...</Text>
        </SafeAreaView>
      </Modal>
    );
  }

  /* ======================================================
     UI
  ====================================================== */
  return (
<Modal
  isVisible={visible}
  style={{ margin: 0 }}
  backdropOpacity={0}
  onBackdropPress={close}
  propagateSwipe
  swipeDirection="down"
  onSwipeComplete={close}
>
  <Animated.View
    style={[
      StyleSheet.absoluteFillObject,
      overlayStyle,
      { backgroundColor: "#0003" },
    ]}
  />

  <SafeAreaView
    style={[
      modalStyles.container,
      { paddingBottom: insets.bottom + 20 },
    ]}
  >
    {/* ================= HEADER (FIXED) ================= */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Atur Halaman Admin</Text>
      <IconButton
        icon="close"
        onPress={close}
        style={styles.closeBtn}
      />
    </View>

    {/* ================= SEARCH (FIXED) ================= */}
    <Searchbar
      placeholder="Cari halaman..."
      value={list.search}
      onChangeText={list.setSearch}
      clearIcon="close"
      onIconPress={list.clearSearch}
      style={styles.search}
    />

    {/* ================= CONTENT (SCROLL) ================= */}
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {list.items.map((pg: any) => {
        const actions = extractPermissionTypes(pg.permissions_type ?? {});
        const selected = permissions[pg.id] ?? [];

        return (
          <View key={pg.id} style={styles.card}>
            <Text style={styles.pageTitle}>{pg.name}</Text>

            {actions.length === 0 ? (
              <Text style={styles.empty}>Tidak ada permission</Text>
            ) : (
              <View style={styles.permissionRow}>
                {actions.map((a: string) => {
                  const checked = selected.includes(a);
                  return (
                    <TouchableOpacity
                      key={a}
                      style={styles.permissionItem}
                      onPress={() => togglePermission(pg.id, a)}
                      activeOpacity={0.7}
                    >
                      <Checkbox
                        status={checked ? "checked" : "unchecked"}
                      />
                      <Text style={styles.permissionLabel}>{a}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* SAVE */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={modalStyles.saveBtn}
      >
        Simpan
      </Button>

    
    </ScrollView>
  </SafeAreaView>
</Modal>

  );
}

/* ======================================================
   STYLES
====================================================== */
const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeBtn: {
    position: "absolute",
    right: 8,
    top: 4,
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#e8f0fe",
  },
  content: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionLabel: {
    fontSize: 14,
    marginLeft: 4,
    textTransform: "capitalize",
  },
  empty: {
    fontStyle: "italic",
    color: "#666",
  },
});

