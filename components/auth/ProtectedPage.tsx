import React, { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { useAccessStore } from "../../store/useAccessStore";
import { useRouter } from "expo-router";

export default function ProtectedPage({
  pageKey,
  children,
}: {
  pageKey: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const allowedPages = useAccessStore((s) => s.allowedPages);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (!allowedPages.includes(pageKey)) {
      router.replace("/forbidden");
      return;
    }
  }, [isHydrated, user, allowedPages, pageKey]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
