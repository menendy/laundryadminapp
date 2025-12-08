import * as React from "react";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";

interface HeaderAction {
  icon: string;
  onPress: () => void;
  color?: string;
}

interface AppHeaderActionsProps {
  title: string;
  actions?: HeaderAction[];
  showBack?: boolean;
  onBackPress?: () => void;
  backgroundColor?: string;
  color?: string;
}

export default function AppHeaderActions({
  title,
  actions = [],
  showBack = true,
  onBackPress,
  backgroundColor = "#fff",
  color = "#000",
}: AppHeaderActionsProps) {
  const router = useRouter();

  return (
    <Appbar.Header
      mode="center-aligned"
      style={{
        backgroundColor,
        elevation: 2,
        shadowColor: "#000",
      }}
    >
      {/* ✅ Tombol Back (opsional) */}
      {showBack && (
        <Appbar.BackAction
          color={color}
          onPress={
  onBackPress ||
  (() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // fallback ke parent route
      router.replace("../");
    }
  })
}

        />
      )}

      <Appbar.Content
        title={title}
        titleStyle={{
          color,
          fontWeight: "700",
        }}
      />

      {/* ✅ Tombol Aksi di kanan */}
      {actions.map((a, i) => (
        <Appbar.Action
          key={i}
          icon={a.icon}
          onPress={a.onPress}
          color={a.color || color}
        />
      ))}
    </Appbar.Header>
  );
}
