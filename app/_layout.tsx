import React from "react";
import { View, Platform, useWindowDimensions, Animated } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import DrawerMenu from "../components/layout/DrawerMenu";
import BottomNav from "../components/layout/BottomNav";
import AlertSnackbar from "../components/ui/AlertSnackbar";
import OfflineBanner from "../components/ui/OfflineBanner";
import { useSnackbarStore } from "../store/useSnackbarStore";

// ✅ Tema global react-native-paper
const theme = {
  ...DefaultTheme,
  roundness: 0,
  colors: {
    ...DefaultTheme.colors,
    primary: "#1976d2", // warna biru utama
    onPrimary: "#ffffff",
    secondary: "#4caf50",
    error: "#d32f2f",
  },
};

export default function Layout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const snackbar = useSnackbarStore();
  const isNarrowScreen = width < 768;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => setDrawerOpen(false));
  };

  React.useEffect(() => {
    if (isNarrowScreen && isDrawerOpen && Platform.OS === "web") {
      closeDrawer();
    }
  }, [isNarrowScreen]);

  return (
    <SafeAreaProvider>
      {/* ✅ Hanya satu PaperProvider */}
      <PaperProvider theme={theme}>
        <OfflineBanner />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AlertSnackbar
            visible={snackbar.visible}
            message={snackbar.message}
            onDismiss={snackbar.hideSnackbar}
            type={snackbar.type}
          />

          <View style={{ flex: 1, backgroundColor: "#f6f7f8" }}>
            {/* Drawer */}
            {isDrawerOpen && (
              <>
                {isWeb ? (
                  <>
                    {isNarrowScreen && (
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
                        width: isNarrowScreen ? width : Math.min(width * 0.22, 280),
                        backgroundColor: "#fff",
                        borderRightWidth: isNarrowScreen ? 0 : 1,
                        borderRightColor: "#e0e0e0",
                        shadowColor: "#000",
                        shadowOpacity: 0.15,
                        shadowRadius: 5,
                        transform: [
                          {
                            translateX: slideAnim.interpolate({
                              inputRange: [-width, 0],
                              outputRange: [-width, 0],
                              extrapolate: "clamp",
                            }),
                          },
                        ],
                        zIndex: 99,
                        elevation: 8,
                      }}
                    >
                      <DrawerMenu onClose={closeDrawer} />
                    </Animated.View>
                  </>
                ) : (
                  <>
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
                    <Animated.View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width,
                        height,
                        backgroundColor: "#fff",
                        transform: [{ translateX: slideAnim }],
                        zIndex: 99,
                        elevation: 8,
                        shadowColor: "#000",
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                      }}
                    >
                      <DrawerMenu onClose={closeDrawer} />
                    </Animated.View>
                  </>
                )}
              </>
            )}

            {/* Konten utama */}
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: "#f6f7f8",
                marginLeft:
                  isWeb && !isNarrowScreen && isDrawerOpen
                    ? Math.min(width * 0.22, 280)
                    : 0,
                transition:
                  isWeb && !isNarrowScreen ? "margin 0.25s ease" : undefined,
              }}
            >
              <Stack screenOptions={{ headerShown: false }} />
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
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
