import React from "react";
import { Animated, TouchableOpacity } from "react-native";

interface IOSSwitchProps {
  value: boolean;
  onChange: (newValue: boolean) => void;
}

export default function IOSSwitch({ value, onChange }: IOSSwitchProps) {
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
      activeOpacity={0.9}
      onPress={() => onChange(!value)}
      style={{
        width: 46,
        height: 28,
        borderRadius: 20,
        justifyContent: "center",
        padding: 2,
        backgroundColor: value ? "#34C759" : "#E5E5EA",
      }}
    >
      <Animated.View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 2,
          transform: [{ translateX: translate }],
        }}
      />
    </TouchableOpacity>
  );
}
