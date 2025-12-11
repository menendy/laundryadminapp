import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, List } from "react-native-paper";

interface ItemProps {
  label: string;
  value?: string;
  left?: () => React.ReactNode;
  right?: () => React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "centerAction";

  // Custom style per item
  labelStyle?: any;
  valueStyle?: any;
}

interface Props {
  title: string;
  items: ItemProps[];
  style?: any;
}

export default function SectionListCard({ title, items, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      {title ? (
        <View style={styles.headerWrapper}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      ) : null}

      {items.map((item, index) => {
        const isCenter = item.variant === "centerAction";

        return (
          <View key={index}>
            {isCenter ? (
              // =====================================================
              // MODE: CENTER ACTION (title center + optional subtitle)
              // =====================================================
              <TouchableOpacity
                onPress={item.onPress}
                activeOpacity={0.6}
                style={styles.centerRow}
              >
                {/* LEFT ICON */}
                <View style={styles.centerLeft}>
                  {item.left ? item.left() : null}
                </View>

                {/* CENTER LABEL */}
                <View style={styles.centerMiddle}>
                  <Text style={[styles.centerLabel, item.labelStyle || {}]}>
                    {item.label}
                  </Text>

                  {item.value ? (
                    <Text
                      style={[styles.centerSubtitle, item.valueStyle || {}]}
                    >
                      {item.value}
                    </Text>
                  ) : null}
                </View>

                {/* RIGHT ICON */}
                <View style={styles.centerRight}>
                  {item.right ? item.right() : null}
                </View>
              </TouchableOpacity>
            ) : (
              // ============================
              // DEFAULT MODE (existing)
              // ============================
              <List.Item
                title={() => (
                  <Text style={[styles.itemTitle, item.labelStyle || {}]}>
                    {item.label}
                  </Text>
                )}
                description={
                  item.value
                    ? () => (
                        <Text
                          style={[styles.itemValue, item.valueStyle || {}]}
                        >
                          {item.value}
                        </Text>
                      )
                    : undefined
                }
                right={() => (
                  <View style={styles.rightContainer}>{item.right?.()}</View>
                )}
                onPress={item.onPress}
                rippleColor="#EDEDED"
                style={styles.listItem}
                contentStyle={styles.listItemContent}
              />
            )}

            {/* Divider */}
            {index < items.length - 1 && <View style={styles.divider} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // =====================
  // CARD CONTAINER
  // =====================
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },

  // =====================
  // HEADER
  // =====================
  headerWrapper: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 18,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  // =====================
  // DEFAULT LIST ITEM
  // =====================
  listItem: {
    paddingHorizontal: 0,
    minHeight: 56,
  },
  listItemContent: {
    paddingHorizontal: 14,
  },

  itemTitle: {
    fontSize: 13,
    color: "#777",
  },

  itemValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  rightContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 4,
  },

  // DIVIDER
  divider: {
    height: 1,
    backgroundColor: "#E6E6E6",
    marginLeft: 14,
  },

  // ========================================================
  // CENTER ACTION MODE (icon left + center title + icon right)
  // ========================================================
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  centerLeft: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  centerMiddle: {
    flex: 1,
    alignItems: "center",
  },

  centerLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  centerSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
    textAlign: "center",
  },

  centerRight: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
