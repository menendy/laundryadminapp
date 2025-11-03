import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNav({ onMenuPress, onMenuClose, isDrawerOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // 🔍 Deteksi tinggi layar (untuk menyesuaikan proporsi tombol)
  const { height } = Dimensions.get("window");

  // Hitung posisi tombol tengah secara adaptif
  const getAdaptiveMarginBottom = () => {
    if (Platform.OS === "android") {
      if (height < 700) return Math.max(insets.bottom - 4, 0); // HP kecil
      if (height < 820) return Math.max(insets.bottom - 8, 0); // HP sedang
      return Math.max(insets.bottom - 12, 0); // HP besar / tablet
    } else if (Platform.OS === "ios") {
      return Math.max(insets.bottom - 6, 0); // iPhone (auto handle notch)
    }
    // Web fallback
    return 8;
  };

  const adaptiveMarginBottom = getAdaptiveMarginBottom();

  // ✅ Helper untuk navigasi dan auto-tutup menu
  const navigateAndClose = (path: string) => {
    if (onMenuClose) onMenuClose(); // tutup menu jika sedang terbuka
    router.push(path); // lalu navigasi
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
        {/* Tombol Dashboard */}
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndClose("/")}
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

        {/* Tombol Karyawan */}
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndClose("/karyawan")}
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
        {/* Tombol Outlet */}
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndClose("/outlet")}
        >
          <MaterialIcons
            name="store"
            size={24}
            color={pathname.startsWith("/outlet") ? "#007bff" : "#666"}
          />
          <Text
            style={{
              fontSize: 12,
              color: pathname.startsWith("/outlet") ? "#007bff" : "#666",
            }}
          >
            Outlet
          </Text>
        </TouchableOpacity>

        {/* Tombol Profil */}
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigateAndClose("/profil")}
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
