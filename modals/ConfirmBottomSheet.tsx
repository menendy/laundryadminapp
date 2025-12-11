import React from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";
import { Button, Text } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface ConfirmBottomSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmBottomSheet({
  visible,
  title,
  message,
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
}: ConfirmBottomSheetProps) {
  const slide = useSharedValue(Platform.OS === "web" ? 0 : 300);

  React.useEffect(() => {
    slide.value = withTiming(visible ? 0 : 300, { duration: 220 });
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slide.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Click backdrop to close */}
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* BOTTOM SHEET */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <SafeAreaView edges={["bottom"]}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <Button mode="contained" onPress={onConfirm} style={styles.confirm}>
            {confirmText}
          </Button>

          <Button mode="outlined" onPress={onCancel} style={styles.cancel}>
            {cancelText}
          </Button>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  message: { fontSize: 15, color: "#555", marginBottom: 25 },
  confirm: { marginBottom: 12, borderRadius: 10 },
  cancel: { borderRadius: 10 },
});
