import * as React from "react";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";

interface AppHeaderBaseProps {
  title: string;
  showBack?: boolean;
  backgroundColor?: string;
  color?: string;
}

export default function AppHeaderBase({
  title,
  showBack = true,
  backgroundColor = "#fff",
  color = "#000",
}: AppHeaderBaseProps) {
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
      {showBack && router.canGoBack() && (
        <Appbar.BackAction onPress={() => router.back()} color={color} />
      )}
      <Appbar.Content
        title={title}
        titleStyle={{ color, fontWeight: "700" }}
      />
    </Appbar.Header>
  );
}
