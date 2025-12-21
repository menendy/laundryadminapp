import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    TouchableWithoutFeedback,
    StyleSheet,
    Keyboard,
} from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { updateAksesPengguna } from "../../../../services/api/aksesPenggunaService";
import { handleBackendError } from "../../../../utils/handleBackendError";
import { useSnackbarStore } from "../../../../store/useSnackbarStore";
//import { useAksesPenggunaStore } from "../../../../store/useAksesPenggunaStore";

export default function EditFieldBottomSheet() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

    const params = useLocalSearchParams<any>();
    const { id, field, label, value, rootPath, basePath } = params;

    const [inputValue, setInputValue] = useState(value || "");
    const [errors, setErrors] = useState<any>({});
    const [saving, setSaving] = useState(false);

    //const setFieldStore = useAksesPenggunaStore((s) => s.setField);

    const overlayOpacity = useSharedValue(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        overlayOpacity.value = withTiming(1, { duration: 200 });

        const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
            setKeyboardHeight(e.endCoordinates.height)
        );
        const hideSub = Keyboard.addListener("keyboardDidHide", () =>
            setKeyboardHeight(0)
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const close = () => {
        overlayOpacity.value = withTiming(0, { duration: 150 });
        setTimeout(() => router.back(), 150);
    };

    const setFieldErrors = (errorMap: any) => {
        setErrors((prev: any) => ({ ...prev, ...errorMap }));
    };


    const handleSave = async () => {
        if (!inputValue.trim()) {
            setErrors({ [field]: `${label} tidak boleh kosong` });
            return;
        }

        try {
            setSaving(true);
            const payload = {
                [field]: inputValue.trim(),
                rootPath,
                basePath,
            };

            const res = await updateAksesPengguna(String(id), payload);
            const ok = handleBackendError(res, setErrors, showSnackbar);
            if (!ok) return;

            //console.log("➡️ Modal SAVE CLICKED");
            //console.log("Payload yang dikirim ke API:", payload);


            // UPDATE STORE → realtime update parent page
            //setFieldStore(field, inputValue.trim());

            // console.log("Store updated:", {
            //     fullState: useAksesPenggunaStore.getState()
            // });


            // Tambahkan router params 
            router.setParams({
                updatedField: field,
                updatedValue: inputValue.trim(),
            });
      

            showSnackbar("Perubahan disimpan", "success");
            close();
        } catch (err: any) {

            const ok = handleBackendError(err, setFieldErrors, showSnackbar);

            if (!ok) {
                const data = err?.response?.data;

                if (data?.field && data?.message) {
                    setFieldErrors({ [data.field]: data.message });
                }

                return;
            }

        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isVisible
            swipeDirection="down"
            onBackdropPress={close}
            onSwipeComplete={close}
            backdropOpacity={0}
            style={{ justifyContent: "flex-end", margin: 0 }}
            propagateSwipe
        >
            <Animated.View style={[StyleSheet.absoluteFillObject, overlayStyle]} />

            <TouchableWithoutFeedback onPress={close}>
                <Animated.View style={[StyleSheet.absoluteFillObject, overlayStyle]} />
            </TouchableWithoutFeedback>

            {/* BOTTOM SHEET */}
            <Animated.View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    transform: [{ translateY: -(keyboardHeight + 8) }],
                }}
            >
                <SafeAreaView
                    edges={["bottom"]}
                    style={{
                        backgroundColor: "#fff",
                        borderTopLeftRadius: 22,
                        borderTopRightRadius: 22,
                        paddingHorizontal: 18,
                        paddingTop: 10,
                        paddingBottom: Math.max(insets.bottom, 12),
                    }}
                >
                    <ScrollView>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ fontSize: 17, fontWeight: "700" }}>
                                Ubah {label}
                            </Text>
                            <IconButton icon="close" onPress={close} />
                        </View>

                        <ValidatedInput
                            label={label}
                            value={inputValue}
                            onChangeText={(t) => {
                                setErrors({});
                                setInputValue(t);
                            }}
                            error={errors[field]}
                            placeholder={`Masukkan ${label}`}
                        />
                    </ScrollView>

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={saving}
                        disabled={saving}
                        style={{ marginTop: 20 }}
                    >
                        Simpan
                    </Button>
                </SafeAreaView>
            </Animated.View>
        </Modal>
    );
}
