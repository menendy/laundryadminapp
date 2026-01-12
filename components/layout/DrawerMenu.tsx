// components/layout/DrawerMenu.tsx
import React from "react";
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

// Import tipe dari helper yang baru dibuat
import { DrawerMenuItem } from "../../utils/menuHelper"; 

const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);

type Props = {
  onClose: () => void;
  onMenuTreeChange?: () => void;
  menuItems: DrawerMenuItem[]; // <--- BARU: Menerima data dinamis
};

export default function DrawerMenu({ onClose, onMenuTreeChange, menuItems }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const scrollRef = React.useRef<ScrollView | null>(null);

  const isWeb = Platform.OS === "web";
  // const isNarrow = width < 768; // (Unused var dihapus optional)

  // state opens
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});

  // cache height
  const heights = React.useRef<Record<string, number>>({});
  const [version, setVersion] = React.useState(0); // force layout

  // animations
  const animRef = React.useRef<Record<string, Animated.Value>>({});

  const getAnim = (key: string) => {
    if (!animRef.current[key]) animRef.current[key] = new Animated.Value(0);
    return animRef.current[key];
  };

  // --------------------------------
  // Toggle parent
  // --------------------------------
  const toggle = (key: string) => {
    const next = !openMap[key];
    setOpenMap((p) => ({ ...p, [key]: next }));

    if (onMenuTreeChange) onMenuTreeChange();

    Animated.timing(getAnim(key), {
      toValue: next ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start(() => {
      if (next && scrollRef.current) {
        scrollRef.current.scrollToEnd({ animated: true });
      }
    });
  };

  // --------------------------------
  // Navigation
  // --------------------------------
  function navigate(path?: string) {
    if (!path) return;

    const isOverlayMode = width < 1200;

    if (isOverlayMode) {
      onClose();
      setTimeout(() => router.push(path), 50);
    } else {
      router.push(path);
    }
  }

  // --------------------------------
  // Recursive Render (Tipe diganti jadi DrawerMenuItem)
  // --------------------------------
  function renderItem(item: DrawerMenuItem, level = 0): JSX.Element {
    const paddingLeft = 16 + level * 16;
    const hasChild = !!item.children?.length;
    // const active = item.path && pathname?.startsWith(item.path); // Logic active (optional)

    // Apakah anaknya ada yang punya children lagi? (nested)
    const hasNestedChild = !!item.children?.some(
      (c) => c.children && c.children.length > 0
    );

    // ============================
    // LEAF (Tidak punya anak)
    // ============================
    if (!hasChild) {
      return (
        <Pressable
          key={item.key}
          onPress={() => navigate(item.path)}
          style={styles.leafRow(paddingLeft)}
        >
          <IconButton
            icon={(item.icon as any) || "circle-small"} // Fallback icon jika null
            size={20}
            style={{ margin: -4, opacity: 0.85 }}
          />
          <Text style={{ flexShrink: 1, flexGrow: 1, marginLeft: 8 }}>
            {item.label}
          </Text>
        </Pressable>
      );
    }

    // ============================
    // PARENT (punya child)
    // ============================
    const anim = getAnim(item.key);
    const isOpen = !!openMap[item.key];
    const maxH = heights.current[item.key] || 0;

    if (hasNestedChild) {
      return (
        <View key={item.key}>
          {/* PARENT ROW */}
          <Pressable
            onPress={() => toggle(item.key)}
            style={({ pressed }) => [
              styles.parentRow,
              pressed && styles.pressedRow,
            ]}
          >
            <View style={[styles.parentLeft, { paddingLeft }]}>
              <IconButton
                icon={(item.icon as any) || "folder"}
                size={20}
                style={{ margin: -4, opacity: 0.8 }}
              />
              <Text style={styles.parentLabel}>{item.label}</Text>
            </View>

            <AnimatedIconButton
              icon={isOpen ? "chevron-up" : "chevron-down"}
              size={20}
              onPress={() => toggle(item.key)}
              style={{ marginRight: 12 }}
            />
          </Pressable>

          {/* Render anak langsung (tanpa animasi height fix untuk nested deep) */}
          {isOpen && (
            <View style={{ paddingLeft: 32, paddingRight: 20 }}>
              {item.children!.map((c) => renderItem(c, level + 1))}
            </View>
          )}
        </View>
      );
    }

    // ============================
    // PARENT NORMAL (anaknya semua leaf)
    // ============================
    return (
      <View key={item.key}>
        {/* PARENT ROW */}
        <Pressable
          onPress={() => toggle(item.key)}
          style={({ pressed }) => [
            styles.parentRow,
            pressed && styles.pressedRow,
          ]}
        >
          <View style={[styles.parentLeft, { paddingLeft }]}>
            <IconButton
              icon={(item.icon as any) || "folder"}
              size={20}
              style={{ margin: -4, opacity: 0.8 }}
            />
            <Text style={styles.parentLabel}>{item.label}</Text>
          </View>

          <AnimatedIconButton
            icon={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            onPress={() => toggle(item.key)}
            style={{ marginRight: 12 }}
          />
        </Pressable>

        {/* Hidden measurement */}
        {!heights.current[item.key] && (
          <View
            style={{ position: "absolute", left: -9999, top: 0, opacity: 0 }}
            onLayout={(e) => {
              heights.current[item.key] = e.nativeEvent.layout.height;
              setVersion((v) => v + 1);
            }}
          >
            <View style={{ paddingLeft: 32, paddingRight: 20 }}>
              {item.children!.map((c) => renderItem(c, level + 1))}
            </View>
          </View>
        )}

        {/* Animated children */}
        <Animated.View
          style={{
            maxHeight: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxH],
            }),
            overflow: "hidden",
          }}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <View style={{ paddingLeft: 32, paddingRight: 20 }}>
            {item.children!.map((c) => renderItem(c, level + 1))}
          </View>
        </Animated.View>
      </View>
    );
  }

  // --------------------------------
  // RENDER ROOT
  // --------------------------------
  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator
    >
      <View style={styles.header}>
        {/* <Text variant="titleMedium" style={{ fontWeight: "600" }}>
          Menu
        </Text>
        <IconButton icon="close" onPress={onClose} /> */}
      </View>

      <Drawer.Section>
        {/* MENGGUNAKAN PROPS MENUITEMS, BUKAN JSON HARDCODED */}
        {menuItems.map((mi) => renderItem(mi))}
      </Drawer.Section>
    </ScrollView>
  );
}

// --------------------------------------------------
// STYLE (Sama persis)
// --------------------------------------------------
const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#e6eeff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leafRow: (paddingLeft: number) => ({
    paddingLeft,
    paddingRight: 20,
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  }),
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingRight: 12,
  },
  pressedRow: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  parentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  parentLabel: {
    marginLeft: 6,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#5b8df9",
  },
});