import React from "react";
import { Animated, TouchableOpacity } from "react-native";

interface IOSSwitchProps {
  value: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean; // ➕ Tambahan baru
}

export default function IOSSwitch({
  value,
  onChange,
  disabled = false, // ➕ Default false
}: IOSSwitchProps) {
  const animated = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animated, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translate = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.9} // 🔒 tidak ada efek tekan ketika disable
      onPress={() => !disabled && onChange(!value)} // 🔒 cegah onPress
      style={{
        width: 46,
        height: 28,
        borderRadius: 20,
        justifyContent: "center",
        padding: 2,
        backgroundColor: disabled
          ? "#C8C8C8" // 🎨 warna disabled
          : value
          ? "#34C759"
          : "#E5E5EA",
      }}
    >
      <Animated.View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: disabled ? 0.05 : 0.2, // 🌫 soft shadow saat disabled
          shadowRadius: 2,
          transform: [{ translateX: translate }],
        }}
      />
    </TouchableOpacity>
  );
}
