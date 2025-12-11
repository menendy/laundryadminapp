import React from "react";
import {
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Keyboard
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, IconButton, Text, Searchbar } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

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
    const initialRole = params.currentRole;

    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

    const list = useSimpleListSearch<any>({
        rootPath,
        basePath,
        fetchFn: getRoleListLite,
        limit: 20, // ❗ Bisa diubah kapan saja
    });

    const [selectedRole, setSelectedRole] = React.useState(initialRole);
    const [saving, setSaving] = React.useState(false);
    const [visible, setVisible] = React.useState(true);

    const overlayOpacity = useSharedValue(0);
    const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

    React.useEffect(() => {
        overlayOpacity.value = withTiming(1, { duration: 200 });
    }, []);

    const close = () => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        setTimeout(() => router.back(), 200);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = { rootPath, basePath, role_ids: [selectedRole] };

            const result = await updateMitraV2(id, payload);
            const ok = handleBackendError(result, () => { }, showSnackbar);
            if (!ok) return;

            showSnackbar("Level akses berhasil diperbarui", "success");

            router.replace({
                pathname: `/karyawan/edit/${id}`,
                params: { rootPath, basePath },
            });

            close();
        } catch (err) {
            handleBackendError(err, () => { }, showSnackbar);
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
                    {
                        flex: 1,
                        paddingBottom: insets.bottom + 20, // naikkan tombol 20px di atas safe area
                    },
                ]}
            >


                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.headerTitle}>Pengaturan Hak Akses Admin</Text>

                        <IconButton
                            icon="close"
                            onPress={close}
                            style={modalStyles.closeBtn}
                        />
                    </View>

                    {/* Search */}
                    <Searchbar
                        placeholder="Cari level akses..."
                        value={list.search}
                        onChangeText={list.setSearch}
                        clearIcon="close"
                        onIconPress={() => list.setSearch("")}
                        style={{ marginBottom: 10, backgroundColor: "#e8f0fe", marginTop: 20 }}
                    />

                    {/* List */}
                    <FlatList
                        data={list.items}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{}}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedRole(item.id);
                                    list.setSearch(item.name);
                                    Keyboard.dismiss();
                                }}
                                style={[
                                    modalStyles.item,
                                    selectedRole === item.id && modalStyles.activeItem,
                                ]}
                            >
                                <Text style={{ fontSize: 15 }}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={() => Keyboard.dismiss()}

                        ListEmptyComponent={
                            !list.loading ? (
                                <Text style={modalStyles.empty}>Tidak ada data role</Text>
                            ) : null
                        }
                        ListFooterComponent={
                            list.loading && list.items.length > 0 ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} />
                            ) : null
                        }
                    />
                </View>

                {/* Save Button */}
                <Button
                    mode="contained"
                    loading={saving}
                    disabled={!selectedRole || saving}
                    onPress={handleSave}
                    style={modalStyles.saveBtn}
                >
                    Simpan
                </Button>
            </SafeAreaView>
        </Modal>
    );
}

