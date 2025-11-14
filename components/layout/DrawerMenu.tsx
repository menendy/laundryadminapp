// DrawerMenu.tsx
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
import { Drawer, Text, IconButton, Divider, Badge } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";

// Animated IconButton
const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);

type MenuItem = {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: string;
  children?: MenuItem[];
};

// --- MENU JSON DI SINI --- //
const MENU_JSON: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "view-dashboard", path: "/" },
  { key: "profil", label: "Profil Akun", icon: "account-circle", path: "/profil" },
  { key: "karyawan", label: "Karyawan", icon: "account-group", path: "/karyawan" },
  {
    key: "pengaturanAkses",
    label: "Pengaturan Akses",
    icon: "shield-account",
    children: [
      { key: "outlet", label: "Outlet", icon: "store", path: "outlets" },
      { key: "group", label: "Group", icon: "account-group-outline", path: "groups" },
      { key: "owner", label: "Owner", icon: "account-group-outline", path: "owners" },
      { key: "role", label: "Role", icon: "account-group-outline", path: "roles" },
      { key: "page_admin", label: "Akses Admin", icon: "account-group-outline", path: "pages_admin" },
      { key: "page_operational", label: "Akses operasional", icon: "account-group-outline", path: "pages_operational" },
       { key: "access", label: "akses", icon: "account-group-outline", path: "access" },
      {
        key: "advanced",
        label: "Advanced",
        icon: "cog-outline",
        children: [
          { key: "roles", label: "Roles", icon: "account-key", path: "/akses/roles" },
          { key: "perms", label: "Permissions", icon: "lock-open", path: "/akses/permissions" },
        ],
      },
    ],
  },
];

export default function DrawerMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isNarrowScreen = width < 768;

  // open state per key
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});

  // anim value per key
  const animRef = React.useRef<Record<string, Animated.Value>>({});

  const getAnim = (key: string) => {
    if (!animRef.current[key]) {
      animRef.current[key] = new Animated.Value(0);
    }
    return animRef.current[key];
  };

  const toggle = (key: string) => {
    const isOpen = !openMap[key];
    setOpenMap({ ...openMap, [key]: isOpen });
    const anim = getAnim(key);
    Animated.timing(anim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  function navigate(path?: string) {
    if (!path) return;
    router.push(path);
    if (!isWeb || isNarrowScreen) {
      onClose();
    }
  }

  // Render menu recursive
  function renderItem(item: MenuItem, level = 0) {
    const hasChild = Array.isArray(item.children) && item.children.length > 0;
    const paddingLeft = 16 + level * 16;

    if (!hasChild) {
      return (
        <Drawer.Item
          key={item.key}
          label={item.label}
          icon={item.icon as any}
          active={pathname === item.path}
          onPress={() => navigate(item.path)}
          style={{ paddingLeft }}
        />
      );
    }

    const anim = getAnim(item.key);
    const rotate = anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    return (
      <View key={item.key}>
        {/* PARENT */}
        <Pressable
          onPress={() => toggle(item.key)}
          style={({ pressed }) => [
            styles.parentRow,
            { paddingLeft },
            pressed && styles.pressedRow,
          ]}
        >
          <View style={styles.parentLeft}>
            <IconButton
              icon={item.icon as any}
              size={20}
              style={{ margin: -4, opacity: 0.8 }}
            />
            <Text style={styles.parentLabel}>{item.label}</Text>
          </View>

          <AnimatedIconButton
            icon="chevron-down"
            size={20}
            style={{ transform: [{ rotate }] }}
            onPress={() => toggle(item.key)}
          />
        </Pressable>

        {/* CHILDREN ANIMATED */}
        <Animated.View
          style={{
            overflow: "hidden",
            opacity: anim,
            transform: [
              {
                scaleY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }}
        >
          <View style={{ paddingLeft: 16 }}>
            {item.children!.map((c) => renderItem(c, level + 1))}
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ fontWeight: "600" }}>
          Menu
        </Text>
        <IconButton icon="close" onPress={onClose} />
      </View>

      <Drawer.Section>{MENU_JSON.map((mi) => renderItem(mi))}</Drawer.Section>

      <Divider />

      <Drawer.Section title="Fitur Baru">
        <Drawer.Item
          label="Fitur Khusus"
          icon="star"
          right={() => <Badge style={styles.badge}>Baru</Badge>}
        />
        <Drawer.Item
          label="QRIS"
          icon="qrcode"
          right={() => <Badge style={styles.badge}>Baru</Badge>}
        />
        <Drawer.Item
          label="Pengaturan Umum"
          icon="cog"
          right={() => <Badge style={styles.badge}>Baru</Badge>}
        />
      </Drawer.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#e6eeff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingRight: 12,
  },
  pressedRow: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  parentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  parentLabel: {
    marginLeft: 6,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#5b8df9",
  },
});
