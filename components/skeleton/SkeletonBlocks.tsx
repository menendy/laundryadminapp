import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SkeletonBlocksProps {
  blocks: { height: number; radius?: number; marginBottom?: number }[];
  paddingBottom?: number;
  background?: string;
  showHeader?: boolean; // ⬅ tambahan di sini
}

export default function SkeletonBlocks({
  blocks,
  paddingBottom = 100,
  background = "#F4F4F4",
  showHeader = true, // default tampilkan header dummy
}: SkeletonBlocksProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: background,
        paddingTop: insets.top, // safe area
      }}
      contentContainerStyle={{
        paddingBottom,
      }}
    >
      {/* HEADER PLACEHOLDER */}
      {showHeader && (
        <View
          style={{
            height: 56, // sama seperti AppHeaderActions
            backgroundColor: "#F4F4F4",
            justifyContent: "center",
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          {/* Title placeholder */}
          <View
            style={{
              width: 180,
              height: 22,
              backgroundColor: "#E4EBF1",
              borderRadius: 8,
            }}
          />
        </View>
      )}

      {/* CONTENT BLOCKS */}
      <View style={{ paddingHorizontal: 16 }}>
        {blocks.map((b, idx) => (
          <View
            key={idx}
            style={{
              height: b.height,
              borderRadius: b.radius ?? 12,
              backgroundColor: "#E4EBF1",
              marginBottom: b.marginBottom ?? 20,
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
