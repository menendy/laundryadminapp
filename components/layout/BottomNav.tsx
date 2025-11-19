import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNav({ onMenuPress, onMenuClose, isDrawerOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions(); // <-- reactive
  const isWeb = Platform.OS === "web";
  const isNarrowScreen = width < 768; // sama breakpoint seperti layout

  // Hitung posisi tombol tengah secara adaptif (tetap seperti sebelumnya)
  const getAdaptiveMarginBottom = () => {
    if (Platform.OS === "android") {
      if (height < 700) return Math.max(insets.bottom - 4, 0);
      if (height < 820) return Math.max(insets.bottom - 8, 0);
      return Math.max(insets.bottom - 12, 0);
    } else if (Platform.OS === "ios") {
      return Math.max(insets.bottom - 6, 0);
    }
    return 8; // web fallback
  };

  const adaptiveMarginBottom = getAdaptiveMarginBottom();

  // NAV helper:
  // - Jika web & lebar >= 768 => jangan tutup drawer saat navigasi
  // - Jika mobile atau web sempit => tutup drawer setelah navigasi
  const navigateAndMaybeClose = (path: string) => {
    // First navigate (kehilangan atau delay kecil di SPA tidak masalah)
    router.push(path);

    // kemudian close jika diperlukan
    const shouldAutoClose = !isWeb || isNarrowScreen;
    if (shouldAutoClose && onMenuClose) {
      onMenuClose();
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#e9eefc",
        paddingVertical: 8,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        borderTopWidth: 1,
        borderColor: "#ddd",
      }}
    >
      {/* Bagian kiri */}
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndMaybeClose("/")}
        >
          <MaterialIcons
            name="home"
            size={24}
            color={pathname === "/" ? "#007bff" : "#666"}
          />
          <Text
            style={{
              fontSize: 12,
              color: pathname === "/" ? "#007bff" : "#666",
            }}
          >
            Depan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndMaybeClose("/karyawan")}
        >
          <MaterialIcons
            name="groups"
            size={24}
            color={pathname.startsWith("/karyawan") ? "#007bff" : "#666"}
          />
          <Text
            style={{
              fontSize: 12,
              color: pathname.startsWith("/karyawan") ? "#007bff" : "#666",
            }}
          >
            Karyawan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tombol Tengah (Menu / Tutup) */}
      <TouchableOpacity
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDrawerOpen ? "#e74c3c" : "#007bff",
          width: 56,
          height: 56,
          borderRadius: 28,
          bottom: (insets.bottom || 8) + 18,
          left: "50%",
          transform: [{ translateX: -28 }],
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 4,
        }}
        onPress={isDrawerOpen ? onMenuClose : onMenuPress}
      >
        <MaterialIcons
          name={isDrawerOpen ? "close" : "menu"}
          size={28}
          color="#fff"
        />
        <Text style={{ fontSize: 10, color: "#fff" }}>
          {isDrawerOpen ? "Tutup" : "Menu"}
        </Text>
      </TouchableOpacity>

      {/* Bagian kanan */}
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndMaybeClose("/outlets")}
        >
          <MaterialIcons
            name="store"
            size={24}
            color={pathname.startsWith("/outlets") ? "#007bff" : "#666"}
          />
          <Text
            style={{
              fontSize: 12,
              color: pathname.startsWith("/outlets") ? "#007bff" : "#666",
            }}
          >
            Outlet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndMaybeClose("/profil")}
        >
          <MaterialIcons
            name="person"
            size={24}
            color={pathname.startsWith("/profil") ? "#007bff" : "#666"}
          />
          <Text
            style={{
              fontSize: 12,
              color: pathname.startsWith("/profil") ? "#007bff" : "#666",
            }}
          >
            Profil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
