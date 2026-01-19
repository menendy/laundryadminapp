import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Props {
  title?: string;
  message?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function UnderDevelopmentScreen({ 
  title = "Fitur Sedang Dibuat", 
  message = "Halaman ini sedang dalam tahap pengembangan oleh tim developer. Silakan kembali lagi nanti.",
  iconName = "cone" // Icon default (traffic cone)
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={iconName} size={64} color="#FF9800" />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <Button 
          mode="contained" 
          onPress={() => router.back()} 
          style={styles.button}
          contentStyle={{ height: 48 }}
          icon="arrow-left"
        >
          Kembali
        </Button>
      </Surface>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  card: {
    width: width - 40,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#FFF3E0", // Orange muda background
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    borderRadius: 8,
  },
});