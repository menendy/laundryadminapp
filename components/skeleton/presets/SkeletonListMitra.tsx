import React from "react";
import { View } from "react-native";
import SkeletonListCard from "./SkeletonListCard";

export default function SkeletonListMitra() {
  return (
    <View style={{ paddingTop: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonListCard key={i} />
      ))}
    </View>
  );
}
