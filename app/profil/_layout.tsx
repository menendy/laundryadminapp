import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "transparentModal",
        animation: "none", // 🔥 PENTING: Matikan animasi router agar tidak kedip/jeda
        headerShown: false,
        //contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}