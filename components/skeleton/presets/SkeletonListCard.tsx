import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SkeletonListCard() {
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 200,
        duration: 1400,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const Shimmer = () => (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { transform: [{ translateX }] }
      ]}
    >
      <LinearGradient
        colors={["#E6E6E6", "#F7F7F7", "#E6E6E6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.title} />
      </View>

      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.lineSmall} />

      <Shimmer />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E6E6E6",
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 14,
    padding: 16,
    overflow: "hidden",
    height: 120,
  },
  row: {
    marginBottom: 12,
  },
  title: {
    width: "60%",
    height: 18,
    backgroundColor: "#DCDCDC",
    borderRadius: 8,
  },
  line: {
    width: "80%",
    height: 12,
    backgroundColor: "#DCDCDC",
    borderRadius: 8,
    marginBottom: 8,
  },
  lineSmall: {
    width: "40%",
    height: 12,
    backgroundColor: "#DCDCDC",
    borderRadius: 8,
  },
});
