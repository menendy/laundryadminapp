import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // 🔌 Listener utama untuk koneksi
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected;
      setIsConnected(connected);
      if (!isReady) setIsReady(true);
    });
    return () => unsubscribe();
  }, [isReady]);

  // 🎞️ Animasi muncul/hilang banner
  useEffect(() => {
    if (!isReady) return; // pastikan status sudah diketahui
    Animated.timing(slideAnim, {
      toValue: isConnected ? -50 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isConnected, isReady]);

  // 🎨 Render banner
  const isOffline = isReady && isConnected === false;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: Platform.OS === "web" ? 0 : 30,
        left: 0,
        right: 0,
        backgroundColor: "#d32f2f",
        paddingVertical: 10,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 3,
      }}
      pointerEvents="none" // biar tidak ganggu tap area lain
    >
      {isOffline && (
        <Text
          style={{
            textAlign: "center",
            color: "white",
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          ⚠️ Tidak ada koneksi internet
        </Text>
      )}
    </Animated.View>
  );
}
