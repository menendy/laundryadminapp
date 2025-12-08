import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  Platform,
  useWindowDimensions,
  UIManager,
  findNodeHandle,
} from "react-native";
import { Portal } from "react-native-paper";

export default function CustomTooltip({ children, message }: any) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const opacity = useRef(new Animated.Value(0)).current;
  const iconRef = useRef<any>(null);
  const { width: screenWidth } = useWindowDimensions();

  const calculatePosition = (event?: any) => {
    const tooltipWidth = 220;

    if (Platform.OS === "web" && event?.nativeEvent) {
      const { pageX, pageY } = event.nativeEvent;
      const flip = pageX + tooltipWidth > screenWidth;

      setPos({
        x: flip ? pageX - tooltipWidth : pageX,
        y: pageY - 45,
      });
      return;
    }

    if (!iconRef.current) return;
    const handle = findNodeHandle(iconRef.current);
    if (!handle) return;

    UIManager.measure(
      handle,
      (_fx, _fy, width, height, px, py) => {
        const flip = px + tooltipWidth > screenWidth;
        setPos({
          x: flip ? px - (tooltipWidth - width) : px,
          y: py - 50,
        });
      }
    );
  };

  const show = (e?: any) => {
    calculatePosition(e);
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <>
      <Pressable
        ref={iconRef}
        onPressIn={show}
        onPressOut={hide}
        {...(Platform.OS === "web"
          ? {
              onHoverIn: show,
              onHoverOut: hide,
            }
          : {})}
      >
        {children}
      </Pressable>

      {visible && (
        <Portal>
          <Animated.View
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              backgroundColor: "#333",
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 8,
              width: 220,
              opacity,
              zIndex: 999999,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, flexWrap: "wrap" }}>
              {message}
            </Text>
          </Animated.View>
        </Portal>
      )}
    </>
  );
}
