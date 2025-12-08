import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    TouchableWithoutFeedback,
    StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../../../store/useSnackbarStore";
import { updateMitraV2 } from "../../../../services/api/mitraService";
import { handleBackendError } from "../../../../utils/handleBackendError";


export default function EditFieldBottomSheet() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
    const [saving, setSaving] = useState(false);


    const params = useLocalSearchParams<any>();
    const id = params.id;
    const field = params.field;
    const label = params.label;
    const initialValue = params.value || "";

    const rootPath = params.rootPath;
    const basePath = params.basePath;

    console.log("▶ PARAMS:", { id, field, label, initialValue, rootPath, basePath });



    const [inputValue, setInputValue] = useState(initialValue);

    const [errors, setErrors] = useState<any>({});
    const [visible, setVisible] = useState(true);

    const overlayOpacity = useSharedValue(0);

    useEffect(() => {
        overlayOpacity.value = withTiming(1, { duration: 200 });
    }, []);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const close = () => {
        overlayOpacity.value = withTiming(0, { duration: 150 });
        setTimeout(() => router.back(), 150);
    };

    const validate = () => {
        const e: any = {};
        if (!inputValue.trim()) {
            e[field] = `${label} tidak boleh kosong`;
        }

        // ⬇⬇ FIX: merge, jangan reset semua errors
        setErrors((prev: any) => ({ ...prev, ...e }));

        return Object.keys(e).length === 0;
    };

    const setFieldErrors = (errorMap: any) => {
        setErrors((prev: any) => ({ ...prev, ...errorMap }));
    };


    const handleSave = async () => {
        if (!validate()) {
            showSnackbar("Lengkapi data dengan benar", "error");
            return;
        }

       try {
    setSaving(true);

    const payload: any = {
        [field]: inputValue.trim(),
        rootPath,
        basePath,
    };

    const result = await updateMitraV2(id, payload);

    const ok = handleBackendError(result, setFieldErrors, showSnackbar);

    if (!ok) {
        // Handle single-field validation format
        if (result?.field && result?.message) {
            setFieldErrors({ [result.field]: result.message });
        }
        return;
    }

    showSnackbar("Perubahan berhasil disimpan", "success");

    router.replace({
        pathname: `/karyawan/edit2/${id}`,
        params: { rootPath, basePath },
    });
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
            isVisible={visible}
            swipeDirection={saving ? undefined : "down"}
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
                <ScrollView keyboardShouldPersistTaps="handled">
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
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
                        onChangeText={(text) => {
                            if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: "" }));

                            if (field === "phone") {
                                let clean = text.replace(/[^0-9]/g, "");
                                if (clean.startsWith("0")) clean = clean.substring(1);

                                setInputValue(clean);
                                return;
                            }

                            setInputValue(text);
                        }}

                        error={errors[field] ?? ""}
                        placeholder={
                            field === "phone" ? "812xxxxxxx" : `Masukkan ${label}`
                        }
                        autoFocus
                        keyboardType={field === "phone" ? "phone-pad" : "default"}
                        prefix={
                            field === "phone" && (
                                <Text style={{ fontSize: 16, color: "#555" }}>+62</Text>
                            )
                        }
                    />


                    <Button
                        mode="contained"
                        style={{ marginTop: 20 }}
                        onPress={handleSave}
                        loading={saving}
                        disabled={saving}
                    >
                        Simpan
                    </Button>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}
