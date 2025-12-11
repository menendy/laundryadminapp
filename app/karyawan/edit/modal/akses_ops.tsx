import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Keyboard,

} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, IconButton, Text, Searchbar } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

import { useSnackbarStore } from "../../../../store/useSnackbarStore";
import { updateMitraV2 } from "../../../../services/api/mitraService";
import { getRoleListLite } from "../../../../services/api/rolesService";
import { useSimpleListSearch } from "../../../../hooks/useSimpleListSearch";
import { handleBackendError } from "../../../../utils/handleBackendError";
import ToggleSwitch from "../../../../components/ui/ToggleSwitch";
import { modalStyles } from "../../../../styles/modalStyles";

export default function AksesOpsModal() {
    const router = useRouter();
    const params = useLocalSearchParams<any>();

    const id = params.id;
    const rootPath = params.rootPath;
    const basePath = params.basePath;
    const initialRole = params.currentRole;
    const [activeKurir, setActiveKurir] = useState(true);
    const [activeProduksi, setActiveProduksi] = useState(true);
    const [activeAdmin, setactiveAdmin] = useState(true);

    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
    const [errors, setErrors] = useState<any>({});

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

            <SafeAreaView style={modalStyles.container}>
                {/* Header */}
                <View style={modalStyles.header}>
                    <Text style={modalStyles.headerTitle}>Pengaturan Hak Akses</Text>

                    <IconButton
                        icon="close"
                        onPress={close}
                        style={modalStyles.closeBtn}
                    />
                </View>


                {/* SECTION: Pengaturan Aplikasi Operasional */}
                <View style={modalStyles.sectionContainer}>
                    <Text style={modalStyles.sectionTitle}>Pengaturan Aplikasi Operasional</Text>

                    {/* Mitra Kurir */}
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: "700", marginBottom: 10 }}>
                            Sebagai Mitra Kurir
                        </Text>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ToggleSwitch value={activeKurir} onChange={setActiveKurir} />
                            <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "600" }}>
                                {activeKurir ? "Ya" : "Tidak"}
                            </Text>
                        </View>

                        {errors.activeKurir && (
                            <Text style={{ color: "red", marginTop: 6 }}>{errors.activeKurir}</Text>
                        )}
                    </View>

                    {/* Mitra Produksi */}
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontWeight: "700", marginBottom: 10 }}>
                            Sebagai Mitra Produksi (Kasir, Cuci, Setrika)
                        </Text>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ToggleSwitch value={activeProduksi} onChange={setActiveProduksi} />
                            <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "600" }}>
                                {activeProduksi ? "Ya" : "Tidak"}
                            </Text>
                        </View>

                        {errors.activeProduksi && (
                            <Text style={{ color: "red", marginTop: 6 }}>{errors.activeProduksi}</Text>
                        )}
                    </View>
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

    )


}

