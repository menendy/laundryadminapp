import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

export default function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="bodyMedium">{title}</Text>
        <Text variant="headlineMedium" style={{ marginTop: 4 }}>
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
});
