import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Keyboard,
  EmitterSubscription,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import ValidatedInput from "../../../components/ui/ValidatedInput";
import { updateUserProfile } from "../../../services/api/usersService";
import { useSnackbarStore } from "../../../store/useSnackbarStore";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { BlurView } from "expo-blur";

export default function EditFieldBottomSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const params = useLocalSearchParams<{
    field?: string;
    label?: string;
    value?: string;
  }>();

  const field = params.field ?? "";
  const label = params.label ?? "";
  const initialValue = typeof params.value === "string" ? params.value : "";

  const [inputValue, setInputValue] = useState(initialValue);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // 🔥 fade overlay
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // 🔥 follow keyboard
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub: EmitterSubscription = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub: EmitterSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const close = () => {
    overlayOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => router.back(), 150);
  };

  const validate = () => {
    const e: any = {};
    if (!inputValue.trim()) e[field] = `${label} tidak boleh kosong`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);
      const payload: any = { [field]: inputValue.trim() };

      const res = await updateUserProfile(payload);
      if (!res.ok) {
        showSnackbar("Gagal menyimpan perubahan", "error");
        return;
      }

      showSnackbar("Berhasil disimpan", "success");
      close();
    } catch {
      showSnackbar("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={close}
      swipeDirection="down"
      onSwipeComplete={close}
      backdropOpacity={0} // penting, supaya belakang tetap terlihat
      style={{ justifyContent: "flex-end", margin: 0, backgroundColor: "transparent", position: "relative" }}
      propagateSwipe
    >

      {/* BACKGROUND BLUR */}
      <Animated.View style={[StyleSheet.absoluteFillObject, overlayStyle]}>
        <BlurView tint="light"  intensity={60} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      {/* CLICK OUTSIDE TO CLOSE */}
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
          transform: [{ translateY: -keyboardHeight }],
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
            paddingBottom: Math.max(insets.bottom, 10),
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
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
              <IconButton icon="close" size={22} onPress={close} />
            </View>

            {/* INPUT */}
            <ValidatedInput
              label={label}
              required
              value={inputValue}
              onChangeText={setInputValue}
              error={errors[field]}
              placeholder={`Masukkan ${label}`}
              autoFocus
              autoCapitalize="words"
            />

            {/* BUTTON */}
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 18, borderRadius: 12 }}
            >
              Simpan
            </Button>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}
