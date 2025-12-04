// DrawerMenu.tsx — OPTIMAL, FAST, MOBILE-FIXED, WEB-FIXED
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

const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);

type MenuItem = {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
};

// --------------------------------------------------
// MENU JSON
// --------------------------------------------------
const MENU_JSON: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "view-dashboard", path: "/" },
  { key: "login", label: "login", icon: "view-dashboard", path: "auth/login" },
  { key: "profil", label: "Profil Akun", icon: "account-circle", path: "/profil" },
  { key: "karyawan", label: "Karyawan", icon: "account-group", path: "/karyawan" },
  { key: "akses_pengguna", label: "Akses Pengguna", icon: "account-group", path: "/akses_pengguna" },
  { key: "sysadmin", label: "Pengaturan Sysadmin", icon: "account-group", path: "/sysadmin" },
  { key: "global_user", label: "Pengaturan Global User", icon: "account-group", path: "/global_user" },

  {
    key: "pengaturanAkses",
    label: "Pengaturan Akses",
    icon: "shield-account",
    children: [
      { key: "outlet", label: "Outlet", icon: "store", path: "outlets" },
      { key: "group", label: "Group", icon: "account-group-outline", path: "groups" },

      {
        key: "owner",
        label: "Owner",
        icon: "account-group",
        children: [
          { key: "owner_list", label: "Daftar Owner", icon: "account-group-outline", path: "owners" },
          { key: "owner_register", label: "Registrasi Owner", icon: "account-plus", path: "auth/register-owner" },
          { key: "owner_activation", label: "Aktivasi Owner", icon: "account-check-outline", path: "owners/aktivasi-owner" },
        ],
      },


      { key: "page_admin", label: "Akses Admin", icon: "account-group-outline", path: "pages_admin" },
      { key: "page_operational", label: "Akses operasional", icon: "account-group-outline", path: "pages_operational" },


    ],
  },
];

type Props = {
  onClose: () => void;
  onMenuTreeChange?: () => void;
};

export default function DrawerMenu({ onClose, onMenuTreeChange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const scrollRef = React.useRef<ScrollView | null>(null);


  const isWeb = Platform.OS === "web";
  const isNarrow = width < 768;

  // state opens
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});

  // cache height
  const heights = React.useRef<Record<string, number>>({});
  const [version, setVersion] = React.useState(0); // force layout after measurement

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
        // Auto scroll ke bottom of expanded menu
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
  // Recursive Render
  // --------------------------------
  function renderItem(item: MenuItem, level = 0): JSX.Element {
    const paddingLeft = 16 + level * 16;
    const hasChild = !!item.children?.length;
    const active = item.path && pathname?.startsWith(item.path);

    // Apakah anaknya ada yang punya children lagi? (nested)
    const hasNestedChild = !!item.children?.some(
      (c) => c.children && c.children.length > 0
    );

    // ============================
    // LEAF
    // ============================
    if (!hasChild) {
      return (
        <Pressable
          key={item.key}
          onPress={() => navigate(item.path)}
          style={styles.leafRow(paddingLeft)}
        >
         <IconButton icon={item.icon as any} size={20} style={{ margin: -4, opacity: 0.85 }} />

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

    // ⚠️ Jika dia punya anak yang juga punya children (nested)
    //    JANGAN gunakan maxHeight + overflow (bisa memotong konten di bawahnya)
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
                icon={item.icon as any}
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

          {/* Jika open → render anaknya dengan tinggi natural */}
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
              icon={item.icon as any}
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

        {/* Hidden measurement (untuk parent ini saja) */}
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
      contentContainerStyle={{
        paddingBottom: 40, // biar ada ruang scroll bawah
      }}
      showsVerticalScrollIndicator
    >
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ fontWeight: "600" }}>Menu</Text>
        <IconButton icon="close" onPress={onClose} />
      </View>

      <Drawer.Section>
        {MENU_JSON.map((mi) => renderItem(mi))}
      </Drawer.Section>


    </ScrollView>
  );
}


// --------------------------------------------------
// STYLE
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
    paddingRight: 20,    // ➜ memberi space kanan untuk teks
    minHeight: 48,
    width: "100%",       // ➜ penuhi lebar drawer
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
