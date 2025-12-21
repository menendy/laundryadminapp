import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../../../store/useSnackbarStore";
import { updateOwner } from "../../../../services/api/ownersService";
import { handleBackendError } from "../../../../utils/handleBackendError";

export default function EditOwnerFieldModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const { id, field, label, value, rootPath, basePath } = params;

  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  /**
   * NOTE:
   * - value dari parent SUDAH tanpa +62
   * - simpan sebagai local number (812xxxx)
   */
  const [inputValue, setInputValue] = useState(value || "");
  const [errors, setErrors] = useState<any>({});
  const [saving, setSaving] = useState(false);


  const setFieldErrors = (errorMap: any) => {
    setErrors((prev: any) => ({ ...prev, ...errorMap }));
  };

  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const close = () => {
    overlayOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => router.back(), 150);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setErrors({ [field]: `${label} tidak boleh kosong` });
      return;
    }

    try {
      setSaving(true);

      const res = await updateOwner(String(id), {
        [field]: inputValue.trim(),
        rootPath,
        basePath,
      });

      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return;

      // realtime update ke parent
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
    >
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: overlayOpacity.value }]}
      />

      <TouchableWithoutFeedback onPress={close}>
        <View style={StyleSheet.absoluteFillObject} />
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
        <ScrollView>
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

          {/* =========================
              SPECIAL CASE: PHONE
          ========================== */}
          {field === "phone" ? (
            <ValidatedInput
              label="Nomor Telepon"
              required
              keyboardType="phone-pad"
              placeholder="812xxxxxxx"
              value={inputValue}
              onChangeText={(v) => {
                let clean = v.replace(/[^0-9]/g, "");

                if (clean.startsWith("0")) {
                  clean = clean.substring(1);
                }

                // tetap boleh kosong (biar UX enak)
                setErrors({});
                setInputValue(clean);
              }}
              error={errors.phone}
              prefix={
                <Text style={{ fontSize: 16, color: "#555" }}>+62</Text>
              }
            />
          ) : (
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
          )}
        </ScrollView>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
        >
          Simpan
        </Button>
      </SafeAreaView>
    </Modal>
  );
}
