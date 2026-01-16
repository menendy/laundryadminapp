import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  InteractionManager,
} from "react-native";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, IconButton, Text, Searchbar } from "react-native-paper";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSnackbarStore } from "../../../../store/useSnackbarStore";
import { updateMitraV2 } from "../../../../services/api/mitraService";
import { getRoleListLite } from "../../../../services/api/rolesService";
import { useSimpleListSearch } from "../../../../hooks/useSimpleListSearch";
import { handleBackendError } from "../../../../utils/handleBackendError";
import { modalStyles } from "../../../../styles/modalStyles";

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function AksesAdminModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const insets = useSafeAreaInsets();

  const { id, rootPath, basePath, rolesAdmin: roleNameFromParent } = params;
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const list = useSimpleListSearch<any>({
    rootPath,
    basePath,
    fetchFn: getRoleListLite,
    limit: 20,
  });

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const hasPrefetched = useRef(false);
  const hasMappedInitialRole = useRef(false);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      setIsVisible(true);
      overlayOpacity.value = withTiming(1, { duration: 300 });
      if (!hasPrefetched.current) {
        hasPrefetched.current = true;
        list.reload();
      }
    });
    return () => interactionPromise.cancel();
  }, []);

  useEffect(() => {
    if (!roleNameFromParent || hasMappedInitialRole.current || list.items.length === 0) return;
    const found = list.items.find((r) => r.name === roleNameFromParent);
    if (found) {
      setSelectedRole(found.id);
      hasMappedInitialRole.current = true;
    }
  }, [roleNameFromParent, list.items]);

  const close = () => {
    Keyboard.dismiss();
    overlayOpacity.value = withTiming(0, { duration: 200 });
    setIsVisible(false);
  };

  const onModalHide = () => router.back();

  const roleItems = useMemo(() => [
    { id: "__EMPTY__", name: "Tidak ada akses admin" },
    ...list.items,
  ], [list.items]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        rootPath,
        basePath,
        role_ids: selectedRole && selectedRole !== "__EMPTY__" ? [selectedRole] : [],
      };
      const result = await updateMitraV2(id, payload);
      if (!handleBackendError(result, () => {}, showSnackbar)) return;

      router.setParams({
        updatedField: "rolesAdmin",
        updatedValue: selectedRole && selectedRole !== "__EMPTY__"
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
      isVisible={isVisible}
      onModalHide={onModalHide}
      onBackdropPress={close}
      onBackButtonPress={close}
      swipeDirection={Platform.OS === 'web' ? undefined : "down"}
      onSwipeComplete={close}
      hasBackdrop={false}
      backdropOpacity={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      useNativeDriver={true}
      statusBarTranslucent={true}
      deviceHeight={WINDOW_HEIGHT + (Platform.OS === 'android' ? 50 : 0)} 
      style={{ margin: 0 }}
      avoidKeyboard={false}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.5)", opacity: overlayOpacity }]} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ 
          minHeight: WINDOW_HEIGHT,
          flex: 1, 
          backgroundColor: "#fff", 
          paddingTop: insets.top,
          paddingBottom: insets.bottom 
        }}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pilih Hak Akses Admin</Text>
            <IconButton icon="close" onPress={close} style={styles.closeBtn} />
          </View>

          {/* SEARCH - Loading icon dihapus agar tidak ramai */}
          <View style={{ paddingHorizontal: 18 }}>
            <Searchbar
              placeholder="Cari level akses..."
              value={list.search}
              onChangeText={list.setSearch}
              clearIcon="close"
              onIconPress={list.clearSearch}
              style={styles.search}
            />
            {/* ProgressBar dihapus agar hanya ada 1 spinner di tengah */}
          </View>

          {/* LIST AREA */}
          <View style={{ flex: 1, paddingHorizontal: 18, marginTop: 10 }}>
            {/* 🔥 Saat list.loading TRUE, list disembunyikan dan spinner muncul */}
            {list.loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1a73e8" />
                <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>Memuat data...</Text>
              </View>
            ) : (
              <FlatList
                data={roleItems}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = item.id === "__EMPTY__" 
                    ? selectedRole === null || selectedRole === "__EMPTY__"
                    : selectedRole === item.id;

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedRole(item.id === "__EMPTY__" ? null : item.id);
                        Keyboard.dismiss();
                      }}
                      style={[modalStyles.item, isSelected && modalStyles.activeItem, styles.row]}
                    >
                      <Text style={{ fontSize: 15 }}>{item.name}</Text>
                      {isSelected && <MaterialCommunityIcons name="check" size={20} color="#1a73e8" />}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={<Text style={modalStyles.empty}>Tidak ada data role</Text>}
              />
            )}
          </View>

          {/* SAVE BUTTON */}
          <View style={{ paddingHorizontal: 18, paddingVertical: 10 }}>
            <Button
              mode="contained"
              loading={saving}
              // Button disabled saat sedang fetching data (search)
              disabled={saving || list.loading}
              onPress={handleSave}
              style={modalStyles.saveBtn}
            >
              Simpan
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  closeBtn: { position: "absolute", right: 8, top: 4 },
  search: {
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    marginTop: 10,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});