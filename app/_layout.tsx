import React from "react";
import {
  View,
  Platform,
  useWindowDimensions,
  Animated,
} from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import DrawerMenu from "../components/layout/DrawerMenu";
import BottomNav from "../components/layout/BottomNav";

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              width: isWeb ? Math.min(width * 0.8, 320) : width, // ⬅️ full width untuk mobile
              height: isWeb ? "100%" : height, // ⬅️ full height untuk mobile
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
  );
}
