import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  View,
  StyleSheet,
  Easing,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AlertSnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  type?: "success" | "error" | "info";
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
  const screenWidth = Dimensions.get("window").width;

  const bgColor =
    type === "success"
      ? "#4CAF50"
      : type === "error"
      ? "#F44336"
      : "#2196F3";

  useEffect(() => {
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

      const timer = setTimeout(() => onDismiss(), 3000);
      return () => clearTimeout(timer);
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
  }, [visible]);

  // 🧭 Posisi ideal tepat di bawah status bar / notch / jam
  const topOffset =
    Platform.OS === "android"
      ? (StatusBar.currentHeight ?? 0) + 4
      : insets.top + 4;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          top: topOffset,
          width: screenWidth,
        },
      ]}
    >
      <View style={[styles.snackbar, { backgroundColor: bgColor }]}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
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
    width: "98%",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: "1%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 6,
  },
  text: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
});
