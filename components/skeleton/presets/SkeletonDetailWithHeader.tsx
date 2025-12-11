import React, { useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Platform,
  Animated,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * SkeletonDetailWithHeader
 * - horizontal shimmer using Animated + LinearGradient
 * - accepts width as number or percentage string ("100%")
 * - TypeScript-friendly: build a ViewStyle object and cast where necessary
 */

export default function SkeletonDetailWithHeader() {
  const insets = useSafeAreaInsets();

  // Animated shimmer movement
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 200,
        duration: 1400,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  /** Props type for block */
  type BlockProps = {
    width: number | string;
    height: number;
    radius?: number;
  };

  /** Render a block with the moving shimmer overlay */
  const ShimmerBlock: React.FC<BlockProps> = ({ width, height, radius = 12 }) => {
    // Build the style as a ViewStyle. We cast width as any to satisfy TS/DimensionValue
    const blockStyle: ViewStyle = {
      width: width as any, // allow "100%" or number
      height,
      borderRadius: radius,
      backgroundColor: "#E6E6E6",
      overflow: "hidden",
    };

    return (
      <View style={blockStyle}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={["#E6E6E6", "#F7F7F7", "#E6E6E6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    );
  };

  const APPBAR_HEIGHT = Platform.OS === "web" ? 64 : 56 + insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
      {/* HEADER SKELETON */}
      <View
        style={{
          height: APPBAR_HEIGHT,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <ShimmerBlock width={28} height={28} radius={6} />
        <ShimmerBlock width={160} height={20} radius={6} />
      </View>

      {/* CONTENT SKELETON */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
          gap: 20,
        }}
      >
        {[90, 180, 130, 70].map((h, i) => (
          <ShimmerBlock key={i} width={"100%"} height={h} radius={16} />
        ))}
      </ScrollView>
    </View>
  );
}
