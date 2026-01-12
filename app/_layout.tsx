// C:\Users\WIN10\laundryadminapp\app\_layout.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Platform,
  useWindowDimensions,
  Animated,
  Text,
  Pressable,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { Stack, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import DrawerMenu from "../components/layout/DrawerMenu";
import BottomNav from "../components/layout/BottomNav";
import AlertSnackbar from "../components/ui/AlertSnackbar";
import OfflineBanner from "../components/ui/OfflineBanner";

import { useSnackbarStore } from "../store/useSnackbarStore";
import { useAuthStore } from "../store/useAuthStore";
import { initAuthTokenListener } from "../services/authTokenListener";

// === IMPORTS UNTUK DYNAMIC MENU ===
import { getPagesAdminList2 } from "../services/api/pagesAdminService2";
import { transformMenuData, DrawerMenuItem } from "../utils/menuHelper";

// =========================
// THEME
// =========================
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

/**
 * =========================================================
 * AppInitializer
 * =========================================================
 */
function AppInitializer({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // 1️⃣ Hydrate store (WAJIB, 1x)
  useEffect(() => {
    hydrate();
  }, []);

  // 2️⃣ Firebase auth token listener (SETELAH hydrate)
  useEffect(() => {
    if (!isHydrated) return;

    const unsubscribe = initAuthTokenListener();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

// =========================================================
// ROOT LAYOUT
// =========================================================
export default function Layout() {
  const { width } = useWindowDimensions();
  const snackbar = useSnackbarStore();
  const isWeb = Platform.OS === "web";
  const segments = useSegments();

  // Breakpoints
  const isMobile = width < 600;
  const isTabletPortrait = width >= 600 && width < 840;
  const isTabletLandscape = width >= 840 && width < 1200;
  const isDesktop = width >= 1200 && width < 1440;
  const isUltraWide = width >= 1440;

  const isOverlay = isMobile || isTabletPortrait;
  const isDocked = isTabletLandscape || isDesktop || isUltraWide;

  const [isDrawerOpen, setDrawerOpen] = React.useState(isDocked);
  const [drawerWidth, setDrawerWidth] = React.useState(280);
  const slideAnim = React.useRef(
    new Animated.Value(isDocked ? 0 : -drawerWidth)
  ).current;
  const [openMapVersion, setOpenMapVersion] = React.useState(0);

  // === STATE BARU: MENU ITEMS DARI API ===
  const [menuItems, setMenuItems] = useState<DrawerMenuItem[]>([]);

  // === FETCH MENU DATA ===
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await getPagesAdminList2();
        if (response.success && response.data) {
          // Transform data flat -> tree
          const tree = transformMenuData(response.data);
          setMenuItems(tree);
        } else {
          console.warn("Gagal mengambil data menu");
        }
      } catch (err) {
        console.error("Error fetch menu:", err);
      }
    };

    fetchMenu();
  }, []);

  // Drawer responsiveness
  useEffect(() => {
    if (isDocked) {
      setDrawerOpen(true);
      slideAnim.setValue(0);
    } else {
      setDrawerOpen(false);
      slideAnim.setValue(-drawerWidth);
    }
  }, [isOverlay, isDocked, width]);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -drawerWidth,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => setDrawerOpen(false));
  };

  // Hide bottom nav on certain routes
  const hideBottomNav =
    segments.includes("pages_admin") && segments.includes("add");

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <OfflineBanner />

          {/* HYDRATION WRAPPER */}
          <AppInitializer>
            {/* Handler Tap-to-dismiss for info-blocking */}
            {snackbar.visible && snackbar.type === "info-blocking" && (
              <Pressable
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 999998,
                }}
                onPress={snackbar.hideSnackbar}
              />
            )}

            <AlertSnackbar
              visible={snackbar.visible}
              message={snackbar.message}
              onDismiss={snackbar.hideSnackbar}
              type={snackbar.type}
            />

            <View style={{ flex: 1, backgroundColor: "#f6f7f8" }}>
              {/* Hidden drawer width calc (WEB DOCKED) */}
              {isWeb && isDocked && (
                <View
                  key={openMapVersion}
                  style={{ position: "absolute", left: -9999, opacity: 0 }}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    if (drawerWidth !== w) setDrawerWidth(w);
                  }}
                >
                  <DrawerMenu
                    menuItems={menuItems}
                    onClose={() => {}}
                    onMenuTreeChange={() => setOpenMapVersion((prev) => prev + 1)}
                  />
                </View>
              )}

              {/* ACTIVE DRAWER (VISIBLE OR SLIDING) */}
              {(isDrawerOpen || isDocked) && (
                <>
                  {isOverlay && (
                    <View
                      onTouchEnd={closeDrawer}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        zIndex: 98,
                      }}
                    />
                  )}

                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: isDocked ? drawerWidth : width,
                      backgroundColor: "#fff",
                      borderRightWidth: isDocked ? 1 : 0,
                      borderRightColor: "#e0e0e0",
                      zIndex: 99,
                      transform: [{ translateX: slideAnim }],
                    }}
                  >
                    <DrawerMenu
                      menuItems={menuItems}
                      onClose={closeDrawer}
                      onMenuTreeChange={() =>
                        setOpenMapVersion((prev) => prev + 1)
                      }
                    />
                  </Animated.View>
                </>
              )}

              {/* CONTENT AREA (STACK) - SEKARANG FLEKSIBEL */}
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: "#f6f7f8",
                  marginLeft: isDocked
                    ? slideAnim.interpolate({
                        inputRange: [-drawerWidth, 0],
                        outputRange: [0, drawerWidth],
                        extrapolate: "clamp",
                      })
                    : 0,
                  // transition properti dihapus agar animasi JS berjalan mulus
                }}
              >
                <Stack screenOptions={{ headerShown: false }} />
              </Animated.View>

              {!hideBottomNav && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                  }}
                >
                  <BottomNav
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