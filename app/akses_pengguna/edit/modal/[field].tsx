import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Keyboard,
  InteractionManager,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { updateAksesPengguna } from "../../../../services/api/aksesPenggunaService";
import { handleBackendError } from "../../../../utils/handleBackendError";
import { useSnackbarStore } from "../../../../store/useSnackbarStore";

export default function EditFieldBottomSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const params = useLocalSearchParams<any>();
  const { id, field, label, value, rootPath, basePath } = params;

  const [inputValue, setInputValue] = useState(value || "");
  const [errors, setErrors] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // STATE KONTROL VISIBILITAS & KEYBOARD
  const [isVisible, setIsVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // 🔥 1. REF UNTUK DATA UPDATE (Anti-Blink)
  const pendingUpdate = useRef<{ field: string; value: string } | null>(null);

  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    // Jalankan modal SETELAH navigasi selesai
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      setIsVisible(true);
      overlayOpacity.value = withTiming(1, { duration: 300 });
    });

    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      interactionPromise.cancel();
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const close = () => {
    Keyboard.dismiss();
    overlayOpacity.value = withTiming(0, { duration: 250 });
    setIsVisible(false);
  };

  // 🔥 2. LOGIC EKSEKUSI DI SINI
  const onModalHide = () => {
    // Jika ada data pending, update params sekarang
    if (pendingUpdate.current) {
        router.setParams({
            updatedField: pendingUpdate.current.field,
            updatedValue: pendingUpdate.current.value,
        });
        
        showSnackbar("Perubahan disimpan", "success");
    }

    // Navigasi back dipanggil tepat setelah modal benar-benar tertutup
    router.back();
  };

  const setFieldErrors = (errorMap: any) => {
    setErrors((prev: any) => ({ ...prev, ...errorMap }));
  };

  const handleSave = async () => {
    // 🔥 3. TUTUP KEYBOARD DULUAN
    Keyboard.dismiss();

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

      // 🔥 4. SIMPAN DATA KE REF & TUTUP MODAL
      // Jangan setParams di sini
      pendingUpdate.current = {
          field: field,
          value: inputValue.trim()
      };

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

  // Kalkulasi padding dinamis agar tidak ada gap saat keyboard tertutup
  const containerPaddingBottom = isKeyboardVisible ? 10 : insets.bottom + 12;

  return (
    <Modal
      isVisible={isVisible}
      onModalHide={onModalHide} // 🔥 5. PASANG LISTENER
      swipeDirection={Platform.OS === 'web' ? undefined : "down"}
      onBackdropPress={close}
      onSwipeComplete={close}
      
      // CONFIG ANTI BLINK
      hasBackdrop={false} 
      backdropOpacity={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating={false}
      useNativeDriver={true} 
      useNativeDriverForBackdrop={true}
      coverScreen={true}
      statusBarTranslucent={true}
      style={{ justifyContent: "flex-end", margin: 0 }}
      propagateSwipe={true} 
      avoidKeyboard={false} // Handle manual via KeyboardAvoidingView
    >
      {/* Custom Transparent Backdrop dengan Reanimated */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "rgba(0,0,0,0.5)", opacity: overlayOpacity },
        ]}
      />

      <TouchableWithoutFeedback onPress={close}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        enabled={Platform.OS === "ios" || isKeyboardVisible} 
        style={{ width: "100%" }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingHorizontal: 18,
            paddingTop: 10,
            paddingBottom: containerPaddingBottom,
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ubah {label}</Text>
            <IconButton icon="close" onPress={close} />
          </View>

          {/* Input Area */}
          <View style={{ maxHeight: Dimensions.get('window').height * 0.6 }}> 
            <ScrollView keyboardShouldPersistTaps="handled">
              <ValidatedInput
                label={label}
                value={inputValue}
                onChangeText={(t) => {
                  setErrors({});
                  setInputValue(t);
                }}
                error={errors[field]}
                placeholder={`Masukkan ${label}`}
                multiline={field === 'description' || field === 'keterangan'}
                numberOfLines={field === 'description' || field === 'keterangan' ? 3 : 1}
              />
            </ScrollView>
          </View>

          {/* Tombol Simpan (Sticky di bawah) */}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          >
            Simpan
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#1976D2",
  }
});