import React from "react";
import { View } from "react-native";
import ShimmerBlock from "../SkeletonBlocks";

export default function SkeletonSection({
  rows = 4,
}: {
  rows?: number;
}) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        gap: 16,
      }}
    >
      {/* Title */}
      <ShimmerBlock width="40%" height={20} radius={6} />

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ShimmerBlock width="50%" height={16} radius={6} />
          <ShimmerBlock width={24} height={24} radius={6} />
        </View>
      ))}
    </View>
  );
}
