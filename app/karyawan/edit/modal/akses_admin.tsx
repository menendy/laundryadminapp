import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, IconButton, Text, Searchbar } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSnackbarStore } from "../../../../store/useSnackbarStore";
import { updateMitraV2 } from "../../../../services/api/mitraService";
import { getRoleListLite } from "../../../../services/api/rolesService";
import { useSimpleListSearch } from "../../../../hooks/useSimpleListSearch";
import { handleBackendError } from "../../../../utils/handleBackendError";
import { modalStyles } from "../../../../styles/modalStyles";

export default function AksesAdminModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const insets = useSafeAreaInsets();

  const id = params.id;
  const rootPath = params.rootPath;
  const basePath = params.basePath;

  // dari parent (boleh null)
  const roleNameFromParent: string | null = params.rolesAdmin ?? null;

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const list = useSimpleListSearch<any>({
    rootPath,
    basePath,
    fetchFn: getRoleListLite,
    limit: 20,
  });

  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [visible] = React.useState(true);

  const hasPrefetched = React.useRef(false);
  const hasMappedInitialRole = React.useRef(false);

  // ================= FETCH AWAL =================
  React.useEffect(() => {
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;
    list.reload();
  }, []);

  // ============ MAP ROLE NAME → ROLE ID ============
  React.useEffect(() => {
    if (!roleNameFromParent) return;
    if (hasMappedInitialRole.current) return;
    if (list.items.length === 0) return;

    const found = list.items.find((r) => r.name === roleNameFromParent);
    if (found) {
      setSelectedRole(found.id);
      hasMappedInitialRole.current = true;
    }
  }, [roleNameFromParent, list.items]);

  // overlay
  const overlayOpacity = useSharedValue(0);
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  React.useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const close = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => router.back(), 200);
  };

  // data + opsi null
  const roleItems = React.useMemo(() => {
    return [
      { id: "__EMPTY__", name: "Tidak ada akses admin" },
      ...list.items,
    ];
  }, [list.items]);

  // 👉 FLAG LOADING AWAL
  const isInitialLoading = list.loading && list.items.length === 0;

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        rootPath,
        basePath,
        role_ids: selectedRole ? [selectedRole] : [],
      };

      const result = await updateMitraV2(id, payload);
      const ok = handleBackendError(result, () => {}, showSnackbar);
      if (!ok) return;

      router.setParams({
        updatedField: "rolesAdmin",
        updatedValue:
          selectedRole
            ? list.items.find((r) => r.id === selectedRole)?.name ?? ""
            : "",
      });

      showSnackbar("Level akses admin berhasil diperbarui", "success");
      close();
    } catch (err) {
      handleBackendError(err, () => {}, showSnackbar);
    } finally {
      setSaving(false);
    }
  };

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
          { flex: 1, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pilih Hak Akses Admin</Text>
            <IconButton icon="close" onPress={close} style={styles.closeBtn} />
          </View>

          {/* SEARCH */}
          <Searchbar
            placeholder="Cari level akses..."
            value={list.search}
            onChangeText={list.setSearch}
            clearIcon="close"
            onIconPress={list.clearSearch}
            style={styles.search}
          />

          {/* 🔄 LOADING AWAL (DI SINI) */}
          {isInitialLoading && (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          )}

          {/* LIST */}
          {!isInitialLoading && (
            <FlatList
              data={roleItems}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => Keyboard.dismiss()}
              renderItem={({ item }) => {
                const isSelected =
                  item.id === "__EMPTY__"
                    ? selectedRole === null
                    : selectedRole === item.id;

                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (item.id === "__EMPTY__") {
                        setSelectedRole(null);
                      } else {
                        setSelectedRole((prev) =>
                          prev === item.id ? null : item.id
                        );
                      }
                      Keyboard.dismiss();
                    }}
                    style={[
                      modalStyles.item,
                      isSelected && modalStyles.activeItem,
                      styles.row,
                    ]}
                  >
                    <Text style={{ fontSize: 15 }}>{item.name}</Text>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#1a73e8"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                !list.loading ? (
                  <Text style={modalStyles.empty}>Tidak ada data role</Text>
                ) : null
              }
            />
          )}
        </View>

        {/* SAVE */}
        <Button
  mode="contained"
  loading={saving}
  disabled={saving || isInitialLoading}
  onPress={handleSave}
  style={modalStyles.saveBtn}
>
  Simpan
</Button>

      </SafeAreaView>
    </Modal>
  );
}

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
    marginBottom: 10,
    backgroundColor: "#e8f0fe",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
