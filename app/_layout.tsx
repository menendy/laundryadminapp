// C:\Users\WIN10\laundryadminapp\app\_layout.tsx
import React from "react";
import { View, Platform, useWindowDimensions, Animated, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import DrawerMenu from "../components/layout/DrawerMenu";
import BottomNav from "../components/layout/BottomNav";
import AlertSnackbar from "../components/ui/AlertSnackbar";
import OfflineBanner from "../components/ui/OfflineBanner";
import { useSnackbarStore } from "../store/useSnackbarStore";
import { AuthHydrate } from "../store/useAuthHydrate";
import { useAuthStore } from "../store/useAuthStore";

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

export default function Layout() {
  const { width, height } = useWindowDimensions();
  const snackbar = useSnackbarStore();

  const isWeb = Platform.OS === "web";
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // -----------------------------------------
  // 📌 MULTI BREAKPOINTS
  // -----------------------------------------
  const isMobile = width < 600;                         // HP
  const isTabletPortrait = width >= 600 && width < 840; // Tablet P
  const isTabletLandscape = width >= 840 && width < 1200; // Tablet L
  const isDesktop = width >= 1200 && width < 1440;     // Desktop
  const isUltraWide = width >= 1440;                   // Ultra-wide

  // Overlay = menu menutupi layar (harus auto-close)
  // Docked = menu selalu terbuka (tidak auto-close)
  const isOverlay =
    isMobile || isTabletPortrait; // overlay on mobile + small tablets

  const isDocked =
    isTabletLandscape || isDesktop || isUltraWide; // desktop mode

  // -----------------------------------------
  // Drawer State (open/close)
  // -----------------------------------------
  const [isDrawerOpen, setDrawerOpen] = React.useState(isDocked);
  const [drawerWidth, setDrawerWidth] = React.useState(280);

  const slideAnim = React.useRef(new Animated.Value(isDocked ? 0 : -drawerWidth)).current;

  // -----------------------------------------
  // AUTO WIDTH — measure hidden drawer
  // -----------------------------------------
  const [openMapVersion, setOpenMapVersion] = React.useState(0);

  // Reopen drawer if switching from overlay → docked
  React.useEffect(() => {
    if (isDocked) {
      setDrawerOpen(true);
      slideAnim.setValue(0);
    } else {
      // overlay mode
      setDrawerOpen(false);
      slideAnim.setValue(-drawerWidth);
    }
  }, [isOverlay, isDocked, width]);

  // -----------------------------------------
  // Drawer open
  // -----------------------------------------
  const openDrawer = () => {
    if (isDocked) return; // docked = always open
    setDrawerOpen(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  // -----------------------------------------
  // Drawer close
  // -----------------------------------------
  const closeDrawer = () => {
    if (isDocked) return; // docked = cannot be closed
    Animated.timing(slideAnim, {
      toValue: -drawerWidth,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => setDrawerOpen(false));
  };

  // -----------------------------------------
  // Layout
  // -----------------------------------------
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <OfflineBanner />
          <AuthHydrate />

          {!isHydrated ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text>Loading...</Text>
            </View>
          ) : (
            <>
              <AlertSnackbar
                visible={snackbar.visible}
                message={snackbar.message}
                onDismiss={snackbar.hideSnackbar}
                type={snackbar.type}
              />

              <View style={{ flex: 1, backgroundColor: "#f6f7f8" }}>

                {/* ----------------------------------------------------
                    Hidden Drawer (for measuring width)
                ---------------------------------------------------- */}
                {isWeb && isDocked && (
                  <View
                    key={openMapVersion}
                    style={{ position: "absolute", left: -9999, top: 0, opacity: 0 }}
                    onLayout={(e) => {
                      const w = e.nativeEvent.layout.width;
                      if (drawerWidth !== w) setDrawerWidth(w);
                    }}
                  >
                    <DrawerMenu
                      onClose={() => {}}
                      onMenuTreeChange={() =>
                        setOpenMapVersion((prev) => prev + 1)
                      }
                    />
                  </View>
                )}

                {/* ----------------------------------------------------
                    DRAWER
                ---------------------------------------------------- */}
                {(isDrawerOpen || isDocked) && (
                  <>
                    {/* overlay scrim */}
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

                        width: isDocked ? drawerWidth : width, // docked = auto-width, overlay = full

                        height: "100%",
                        backgroundColor: "#fff",
                        borderRightWidth: isDocked ? 1 : 0,
                        borderRightColor: "#e0e0e0",
                        zIndex: 99,

                        transform: [{ translateX: slideAnim }],
                      }}
                    >
                      <DrawerMenu
                        onClose={closeDrawer}
                        onMenuTreeChange={() =>
                          setOpenMapVersion((prev) => prev + 1)
                        }
                      />
                    </Animated.View>
                  </>
                )}

                {/* ----------------------------------------------------
                    MAIN CONTENT
                ---------------------------------------------------- */}
                <Animated.View
                  style={{
                    flex: 1,
                    backgroundColor: "#f6f7f8",

                    // shift content only when docked
                    marginLeft: isDocked ? drawerWidth : 0,

                    transition: isWeb ? "margin 0.25s ease" : undefined,
                  }}
                >
                  <Stack screenOptions={{ headerShown: false }} />
                </Animated.View>

                {/* ----------------------------------------------------
                    BOTTOM NAV
                ---------------------------------------------------- */}
                <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                  <BottomNav
                    onMenuPress={openDrawer}
                    onMenuClose={closeDrawer}
                    isDrawerOpen={isDrawerOpen}
                  />
                </View>
              </View>
            </>
          )}
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
