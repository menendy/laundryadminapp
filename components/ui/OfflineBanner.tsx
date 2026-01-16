import React, { useEffect, useRef, useState } from "react";
import { Text, Animated, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query"; // Tambahkan ini
import { useSnackbarStore } from "../../store/useSnackbarStore";

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  
  const queryClient = useQueryClient(); // Inisialisasi Query Client
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected;
      setIsConnected(connected);
      if (!isReady) setIsReady(true);

      // Logika Notifikasi & Sinkronisasi
      if (!isFirstRender.current) {
        if (connected) {
          // 1. Notifikasi Online
          showSnackbar("Kembali Online! Data sedang disinkronkan.", "success");
          
          // 2. OTOMATIS REFRESH DATA (Logic yang Anda minta)
          // Semua query yang sedang aktif akan ditarik ulang dari database Firebase
          queryClient.invalidateQueries(); 
        } else {
          // 3. Notifikasi Offline
          showSnackbar("Koneksi terputus. Periksa database atau internet Anda.", "error");
        }
      } else {
        isFirstRender.current = false;
      }
    });

    return () => unsubscribe();
  }, [isReady, showSnackbar, queryClient]);

  useEffect(() => {
    if (!isReady) return;
    Animated.timing(slideAnim, {
      toValue: isConnected ? -100 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isConnected, isReady]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: Platform.OS === "web" ? 0 : 30,
        left: 0,
        right: 0,
        backgroundColor: "#d32f2f",
        paddingVertical: 10,
        zIndex: 99999,
        transform: [{ translateY: slideAnim }],
        elevation: 10,
      }}
      pointerEvents="none"
    >
      <Text style={{ textAlign: "center", color: "white", fontWeight: "600" }}>
        ⚠️ Tidak ada koneksi internet
      </Text>
    </Animated.View>
  );
}