import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  useWindowDimensions,
  Platform,
  Animated,
  Pressable,
  StyleSheet,
} from "react-native";
import { Drawer, Text, IconButton } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Tambahkan ini

import { DrawerMenuItem } from "../../utils/menuHelper";

const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);

type Props = {
  onClose: () => void;
  onMenuTreeChange?: () => void;
  menuItems: DrawerMenuItem[];
};

const DrawerMenu = memo(({ onClose, onMenuTreeChange, menuItems }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets(); // Ambil tinggi status bar
  const scrollRef = useRef<ScrollView | null>(null);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const heights = useRef<Record<string, number>>({});
  const [, setVersion] = useState(0); 
  const animRef = useRef<Record<string, Animated.Value>>({});

  const getAnim = useCallback((key: string) => {
    if (!animRef.current[key]) animRef.current[key] = new Animated.Value(0);
    return animRef.current[key];
  }, []);

  // 🔄 Auto-expand folder jika ada anak yang aktif
  useEffect(() => {
    const findAndOpenActiveParent = (items: DrawerMenuItem[]) => {
      items.forEach(item => {
        if (item.children?.some(child => child.path === pathname)) {
          setOpenMap(prev => ({ ...prev, [item.key]: true }));
          Animated.timing(getAnim(item.key), { toValue: 1, duration: 0, useNativeDriver: false }).start();
        } else if (item.children) {
          findAndOpenActiveParent(item.children);
        }
      });
    };
    findAndOpenActiveParent(menuItems);
  }, [pathname, menuItems]);

  const toggle = useCallback((key: string) => {
    const next = !openMap[key];
    setOpenMap((p) => ({ ...p, [key]: next }));

    if (onMenuTreeChange) onMenuTreeChange();

    Animated.timing(getAnim(key), {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [openMap, onMenuTreeChange, getAnim]);

  const navigate = useCallback((path?: string) => {
    if (!path) return;
    const isOverlayMode = width < 1200;

    if (isOverlayMode) {
      onClose();
      setTimeout(() => router.push(path), 150);
    } else {
      router.push(path);
    }
  }, [width, onClose, router]);

  function renderItem(item: DrawerMenuItem, level = 0): JSX.Element {
    const paddingLeft = 16 + level * 16;
    const hasChild = !!item.children?.length;
    const isActive = item.path ? pathname === item.path : false;
    const isOpen = !!openMap[item.key];
    const anim = getAnim(item.key);
    const maxH = heights.current[item.key] || 0;

    if (!hasChild) {
      return (
        <Pressable
          key={item.key}
          onPress={() => navigate(item.path)}
          style={[
            styles.leafRow(paddingLeft),
            isActive && styles.activeLeafRow
          ]}
        >
          <IconButton
            icon={(item.icon as any) || "circle-small"}
            size={20}
            iconColor={isActive ? "#1976d2" : "#666"}
            style={{ margin: -4, opacity: 0.85 }}
          />
          <Text style={[
            styles.leafLabel,
            isActive && styles.activeText
          ]}>
            {item.label}
          </Text>
        </Pressable>
      );
    }

    return (
      <View key={item.key}>
        <Pressable
          onPress={() => toggle(item.key)}
          style={({ pressed }) => [
            styles.parentRow,
            pressed && styles.pressedRow,
            isOpen && styles.openedParentRow // Style saat folder terbuka
          ]}
        >
          <View style={[styles.parentLeft, { paddingLeft }]}>
            <IconButton
              icon={(item.icon as any) || "folder-outline"}
              size={20}
              iconColor={isOpen ? "#1976d2" : "#666"}
              style={{ margin: -4, opacity: 0.8 }}
            />
            <Text style={[styles.parentLabel, isOpen && styles.activeText]}>{item.label}</Text>
          </View>
          <AnimatedIconButton
            icon={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            onPress={() => toggle(item.key)}
            style={{ marginRight: 12 }}
          />
        </Pressable>

        {!heights.current[item.key] && (
          <View
            style={styles.hiddenMeasure}
            onLayout={(e) => {
              heights.current[item.key] = e.nativeEvent.layout.height;
              setVersion((v) => v + 1);
            }}
          >
            <View style={{ paddingLeft: 20 }}>
              {item.children!.map((c) => renderItem(c, level + 1))}
            </View>
          </View>
        )}

        <Animated.View
          style={{
            maxHeight: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxH || 500],
            }),
            overflow: "hidden",
            opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] }),
          }}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <View>{item.children!.map((c) => renderItem(c, level + 1))}</View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={Platform.OS === "web"}
      >
        <Drawer.Section style={{ borderBottomWidth: 0 }}>
          {menuItems.map((mi) => renderItem(mi))}
        </Drawer.Section>
      </ScrollView>
    </View>
  );
});

export default DrawerMenu;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  leafRow: (paddingLeft: number) => ({
    paddingLeft,
    paddingRight: 20,
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  }),
  leafLabel: { flexShrink: 1, flexGrow: 1, marginLeft: 8, color: "#444" },
  activeLeafRow: { backgroundColor: "#e3f2fd", borderRightWidth: 3, borderRightColor: "#1976d2" },
  activeText: { color: "#1976d2", fontWeight: "bold" },
  parentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingRight: 12 },
  openedParentRow: { backgroundColor: "#f8f9fa" },
  pressedRow: { backgroundColor: "rgba(0,0,0,0.06)" },
  parentLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  parentLabel: { marginLeft: 6, fontWeight: "500", color: "#333" },
  hiddenMeasure: { position: "absolute", left: -9999, top: 0, opacity: 0 },
});