import React from "react";
import { View, Platform, useWindowDimensions, Animated } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import DrawerMenu from "../components/layout/DrawerMenu";
import BottomNav from "../components/layout/BottomNav";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AlertSnackbar from "../components/ui/AlertSnackbar";
import { useSnackbarStore } from "../store/useSnackbarStore";

export default function Layout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  // ✅ ambil store hanya sekali, bukan di JSX langsung
  const snackbar = useSnackbarStore();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* ⬇️ Snackbar GLOBAL - ditempatkan di luar PaperProvider */}
        <AlertSnackbar
          visible={snackbar.visible}
          message={snackbar.message}
          onDismiss={snackbar.hideSnackbar}
          type={snackbar.type}
        />

        <PaperProvider>
          <View style={{ flex: 1, backgroundColor: "#f6f7f8" }}>
            {/* Halaman utama */}
            <Stack screenOptions={{ headerShown: false }} />

            {/* Overlay transparan */}
            {isDrawerOpen && (
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

            {/* Drawer Overlay */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: isWeb ? Math.min(width * 0.8, 320) : width,
                height: isWeb ? "100%" : height,
                backgroundColor: "#fff",
                transform: [{ translateX: slideAnim }],
                zIndex: 99,
                elevation: 8,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}
            >
              {isDrawerOpen && <DrawerMenu onClose={closeDrawer} />}
            </Animated.View>

            {/* Bottom Navigation */}
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
          </View>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
