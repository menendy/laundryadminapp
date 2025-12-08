import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  View,
  StyleSheet,
  Easing,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AlertSnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  type?: "success" | "error" | "info" | "info-blocking";
}

export default function AlertSnackbar({
  visible,
  message,
  onDismiss,
  type = "info",
}: AlertSnackbarProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isBlocking = type === "info-blocking";

  const bgColor =
    type === "success"
      ? "#4CAF50"
      : type === "error"
      ? "#F44336"
      : type === "info-blocking"
      ? "#FFC107" // 🟨 Warning color
      : "#2196F3";

  useEffect(() => {
    let timer: any;

    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      if (!isBlocking) {
        timer = setTimeout(() => onDismiss(), 3000);
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => clearTimeout(timer);
  }, [visible]);

  const topOffset =
    Platform.OS === "android"
      ? (StatusBar.currentHeight ?? 24) + 10
      : insets.top + 10;

  return (
    <TouchableWithoutFeedback
      onPress={isBlocking ? onDismiss : undefined} // ⬅ TAP OUTSIDE to dismiss (only for blocking)
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.container,
          { transform: [{ translateY }], opacity, top: topOffset },
        ]}
      >
        <View style={[styles.snackbar, { backgroundColor: bgColor }]}>
          <Text style={styles.text}>{message}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999999,
    elevation: 999999,
  },
  snackbar: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  text: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});
