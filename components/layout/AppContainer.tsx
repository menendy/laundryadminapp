import React from "react";
import { View } from "react-native";
import AppHeader from "./AppHeader";

export default function AppContainer({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={title} />
      {children}
    </View>
  );
}
