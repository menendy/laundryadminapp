import React from "react";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";

export default function AppHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <Appbar.Header>
      <Appbar.Content title={title} />
      <Appbar.Action icon="home" onPress={() => router.push("/")} />
      <Appbar.Action icon="account" onPress={() => router.push("/karyawan")} />
    </Appbar.Header>
  );
}
