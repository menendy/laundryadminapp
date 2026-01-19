import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import {
  View,
  Platform,
  useWindowDimensions,
  Animated,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme as DefaultTheme, PaperProvider, Portal } from "react-native-paper";
import { Stack, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

// === TANSTACK QUERY IMPORTS ===
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  QueryCache,
} from "@tanstack/react-query";

import DrawerMenu from "../components/layout/DrawerMenu";
import BottomNav from "../components/layout/BottomNav";
import AlertSnackbar from "../components/ui/AlertSnackbar";
import OfflineBanner from "../components/ui/OfflineBanner";

import { useSnackbarStore } from "../store/useSnackbarStore";
import { useAuthStore } from "../store/useAuthStore";
import { initAuthTokenListener } from "../services/authTokenListener";
import { handleBackendError } from "../utils/handleBackendError";

import { getPagesAdminList2 } from "../services/api/pagesAdminService2";
import { transformMenuData } from "../utils/menuHelper";
import { useBasePath } from "../utils/useBasePath";

// =========================================================
// 1. GLOBAL ERROR & QUERY CLIENT CONFIG
// =========================================================
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Global Query Error:", error);
    },
  }),
  defaultOptions: {
    queries: {
     // 🔥 1. DATA SELALU BASI DETIK ITU JUGA
      // Ini memaksa React Query untuk selalu melakukan request ke server 
      // setiap kali komponen di-mount atau window focus.
      staleTime: 0, 

      // 2. SIMPAN CACHE 5 MENIT
      // Data lama tetap disimpan di memori agar user tidak melihat layar putih (blank)
      // saat loading. User lihat data lama dulu, baru update otomatis.
      gcTime: 1000 * 60 * 5, 
      
      networkMode: "online",
      
      // 🔥 3. TRIGGER REFRESH OTOMATIS
      refetchOnMount: true,       // Pindah Halaman -> Refresh
      refetchOnWindowFocus: false, // Buka App dari background -> Refresh
      refetchOnReconnect: true,   // Internet nyala lagi -> Refresh
      
      retry: 0,
    },
  },
});

const theme = {
  ...DefaultTheme,
  roundness: 10,
  colors: {
    ...DefaultTheme.colors,
    primary: "#1976d2",
    onPrimary: "#ffffff",
    secondary: "#4caf50",
    error: "#d32f2f",
  },
};

const MemoizedDrawerMenu = memo(DrawerMenu);
const MemoizedBottomNav = memo(BottomNav);

/**
 * AppInitializer
 */
function AppInitializer({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const unsubscribe = initAuthTokenListener();
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 10 }}>Menghubungkan ke Server...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

// =========================================================
// ROOT LAYOUT
// =========================================================
export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}

function RootLayoutContent() {
  const { width } = useWindowDimensions();
  const snackbar = useSnackbarStore();
  const isWeb = Platform.OS === "web";
  const segments = useSegments();
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Responsivitas Breakpoints
  const isMobile = width < 600;
  const isTabletPortrait = width >= 600 && width < 840;
  const isTabletLandscape = width >= 840 && width < 1200;
  const isDesktop = width >= 1200 && width < 1440;
  const isUltraWide = width >= 1440;

  const isOverlay = isMobile || isTabletPortrait;
  const isDocked = isTabletLandscape || isDesktop || isUltraWide;
  const { rootBase: rootPath, basePath } = useBasePath();

  // ============================================================
  // 3. FETCH MENU DENGAN TANSTACK QUERY & HANDLE ERROR
  // ============================================================
  const { data: menuItems = [] } = useQuery({
    // 🔥 PERUBAHAN UTAMA: KEY STATIS
    // Gunakan string tetap. Jangan masukkan rootPath/basePath ke dalam Key.
    // Ini membuat React Query menganggap semua halaman menggunakan data cache yang SAMA.
    queryKey: ["admin-menu-global"], 
    
    queryFn: async () => {
      const response = await getPagesAdminList2(rootPath, basePath);
      const ok = handleBackendError(response as any, () => {}, snackbar.showSnackbar);
      if (!ok) throw new Error(response.message || "Gagal memuat menu");
      return response.data;
    },
    select: (data) => transformMenuData(data),
    enabled: isHydrated, // Hanya jalan kalau token sudah siap

    // 🔥 CONFIG "JANGAN PERNAH FETCH LAGI"
    staleTime: Infinity,        // Data dianggap fresh selamanya
    gcTime: Infinity,           // Jangan pernah dihapus dari memori
    refetchOnMount: false,      // Jangan fetch saat component mount ulang
    refetchOnWindowFocus: false, // Jangan fetch saat pindah tab
    refetchOnReconnect: false,   // Jangan fetch saat internet nyala lagi
  });
  // ============================================================

  const [isDrawerOpen, setDrawerOpen] = useState(isDocked);
  const [drawerWidth, setDrawerWidth] = useState(280);
  const [openMapVersion, setOpenMapVersion] = useState(0);

  const dynamicDrawerWidth = isDocked ? drawerWidth : width;
  const slideAnim = useRef(new Animated.Value(isDocked ? 0 : -dynamicDrawerWidth)).current;

const hideBottomNav = useMemo(() => {
    
    
    // Sembunyikan BottomNav saat di halaman "Edit Outlet"
    // (URL mengandung "profil" DAN "editOutlet")
    const isEditOutlet = segments.includes("profil") && segments.includes("editOutlet");

    // Return TRUE jika salah satu kondisi terpenuhi
    return  isEditOutlet;
  }, [segments]);

  useEffect(() => {
    if (isDocked) {
      setDrawerOpen(true);
      slideAnim.setValue(0);
    } else {
      if (!isDrawerOpen) slideAnim.setValue(-width);
    }
  }, [isDocked, width]);

  const openDrawer = useCallback(() => {
    if (isDocked) return;
    setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: !isWeb,
    }).start();
  }, [isDocked, isWeb]);

  const closeDrawer = useCallback(() => {
    if (isDocked) return;
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 250,
      useNativeDriver: !isWeb,
    }).start(() => setDrawerOpen(false));
  }, [isDocked, width, isWeb]);

  const handleMenuTreeChange = useCallback(() => {
    setOpenMapVersion((prev) => prev + 1);
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <OfflineBanner />
          <AppInitializer>
            <Portal>
              {snackbar.visible && snackbar.type === "info-blocking" && (
                <Pressable style={styles.snackbarOverlay} onPress={snackbar.hideSnackbar} />
              )}

              <AlertSnackbar
                visible={snackbar.visible}
                message={snackbar.message}
                onDismiss={snackbar.hideSnackbar}
                type={snackbar.type}
              />
            </Portal>

            <View style={{ flex: 1, backgroundColor: "#f6f7f8" }}>
              {isWeb && isDocked && (
                <View
                  key={openMapVersion}
                  style={styles.hiddenMeasure}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    if (drawerWidth !== w) setDrawerWidth(w);
                  }}
                >
                  <MemoizedDrawerMenu
                    menuItems={menuItems}
                    onClose={() => {}}
                    onMenuTreeChange={handleMenuTreeChange}
                  />
                </View>
              )}

              {(isDrawerOpen || isDocked) && (
                <Animated.View
                  style={[
                    styles.drawerContainer,
                    {
                      width: dynamicDrawerWidth,
                      transform: [{ translateX: slideAnim }],
                      zIndex: isOverlay ? 1000 : 99,
                    },
                  ]}
                >
                  <MemoizedDrawerMenu
                    menuItems={menuItems}
                    onClose={closeDrawer}
                    onMenuTreeChange={handleMenuTreeChange}
                  />
                </Animated.View>
              )}

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#f6f7f8",
                  marginLeft: isDocked ? drawerWidth : 0,
                }}
              >
                <Stack screenOptions={{ headerShown: false }} />
              </View>

              {!hideBottomNav && (
                <View style={styles.bottomNavWrapper}>
                  <MemoizedBottomNav
                    onMenuPress={openDrawer}
                    onMenuClose={closeDrawer}
                    isDrawerOpen={isDrawerOpen}
                  />
                </View>
              )}
            </View>
          </AppInitializer>
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  snackbarOverlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 999998 },
  hiddenMeasure: { position: "absolute", left: -9999, opacity: 0 },
  drawerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  bottomNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
  },
});