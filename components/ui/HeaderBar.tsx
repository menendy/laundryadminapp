import React from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderBarProps {
  title: string;
  showBackButton?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export default function HeaderBar({
  title,
  showBackButton = false,
  backgroundColor = "#1976D2",
  textColor = "white",
}: HeaderBarProps) {
  const { height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  // Tinggi header disesuaikan dengan platform
  const paddingTop = isWeb ? 20 : insets.top + 8;
  const paddingBottom = isWeb ? 12 : 14;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop,
          paddingBottom,
        },
      ]}
    >
      {/* Tombol back (opsional) */}
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBack}
          style={[
            styles.backButton,
            {
              top: paddingTop + 2, // sedikit offset agar pas
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
      )}

      {/* Judul tengah */}
      <Text
        style={[
          styles.title,
          {
            color: textColor,
            fontSize: isWeb ? 22 : 20,
            marginTop: showBackButton ? 0 : 0,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 2,
  },
});
