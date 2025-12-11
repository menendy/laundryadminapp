// components/skeleton/SkeletonAuto.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ViewStyle,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
} from "react-native";

type BlockRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
  key: string;
};

interface SkeletonAutoProps {
  loading: boolean;
  children: React.ReactNode;
  // minimal ukuran agar tidak menangkap very small elements like icons
  minHeight?: number;
  minWidth?: number;
  backgroundColor?: string;
}

function resolveStyle(style: StyleProp<ViewStyle>): ViewStyle {
  if (!style) return {};
  if (Array.isArray(style)) {
    return Object.assign({}, ...style);
  }
  return style as ViewStyle;
}

export default function SkeletonAuto({
  loading,
  children,
  minHeight = 30,
  minWidth = 50,
  backgroundColor = "#E4EBF1",
}: SkeletonAutoProps) {
  const layoutRef = useRef<Record<string, BlockRect>>({});
  const [measured, setMeasured] = useState(false);
  const [blocks, setBlocks] = useState<BlockRect[]>([]);
  const measureTimeoutRef = useRef<number | null>(null);

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, []);

  // recursive clone: inject onLayout into elements that have a style prop (likely Views)
  const scan = (node: React.ReactNode, path: string = "0"): React.ReactNode => {
    if (!React.isValidElement(node)) return node;

    const props: any = node.props ?? {};
    const childKey = `${path}`;

    // decide whether to attach onLayout:
    const hasStyle = !!props.style;
    // also attach to functional components with children so we can capture card wrappers
    const shouldAttach = hasStyle;

    const onLayoutHandler = (e: LayoutChangeEvent) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      if (width >= minWidth && height >= minHeight) {
        const style = resolveStyle(props.style);
        const radius =
          typeof style.borderRadius === "number" ? style.borderRadius : 12;
        layoutRef.current[childKey] = {
          x,
          y,
          width,
          height,
          borderRadius: radius,
          key: childKey,
        };
      }
    };

    const newProps: any = { ...props };

    if (shouldAttach) {
      // preserve existing onLayout if any (call both)
      const prev = props.onLayout;
      newProps.onLayout = (e: LayoutChangeEvent) => {
        try {
          onLayoutHandler(e);
        } catch (err) {
          // ignore
        }
        if (typeof prev === "function") prev(e);
      };
    }

    if (props.children) {
      newProps.children = React.Children.map(props.children, (c, i) =>
        scan(c, `${childKey}-${i}`)
      );
    }

    return React.cloneElement(node, newProps);
  };

  // When loading start: render measured (invisible) children to collect layout,
  // after a short delay read layoutRef and produce blocks.
  useEffect(() => {
    if (!loading) {
      // reset measured state when loading finishes (so next time will re-measure if needed)
      setMeasured(false);
      setBlocks([]);
      layoutRef.current = {};
      return;
    }

    // start a timer to collect layouts after a tick
    if (measureTimeoutRef.current) {
      clearTimeout(measureTimeoutRef.current);
    }

    // give React a moment to layout the injected onLayout handlers
    measureTimeoutRef.current = (setTimeout(() => {
      const arr = Object.values(layoutRef.current || {});
      // sort by y to render skeleton top-to-bottom
      arr.sort((a, b) => a.y - b.y);
      setBlocks(arr);
      setMeasured(true);
      measureTimeoutRef.current = null;
    }, 80) as unknown) as number;
  }, [loading, children, minHeight, minWidth]);

  // Render flow:
  // 1) loading && !measured : render children (cloned with onLayout) invisibly to measure
  // 2) loading && measured : render skeleton overlay using measured blocks
  // 3) !loading : render children normally

  if (loading && !measured) {
    // render invisible measuring tree (opacity:0 and pointerEvents none so it doesn't interfere)
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.measurer} pointerEvents="none" accessible={false}>
          {React.Children.map(children, (c, i) => scan(c, `root-${i}`))}
        </View>
      </View>
    );
  }

  if (loading && measured) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
        {blocks.map((b) => (
          <View
            key={b.key}
            style={{
              position: "absolute",
              top: b.y,
              left: b.x,
              width: b.width,
              height: b.height,
              backgroundColor,
              borderRadius: b.borderRadius ?? 12,
            }}
          />
        ))}
      </View>
    );
  }

  // normal rendering
  return <>{children}</>;
}

const styles = StyleSheet.create({
  measurer: {
    flex: 1,
    opacity: 0,
    // keep layout identical: don't change flex/positioning
  },
});
