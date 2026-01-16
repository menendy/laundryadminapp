import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, RadioButton } from "react-native-paper";

interface GenderInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function GenderInput({ value, onChange }: GenderInputProps) {
  return (
    <View>
      <RadioButton.Group onValueChange={onChange} value={value}>
        <View style={styles.radioOption}>
          <RadioButton value="Pria" color="#1976D2" />
          <TouchableOpacity onPress={() => onChange("Pria")}>
            <Text style={styles.radioLabel}>Pria</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radioOption}>
          <RadioButton value="Wanita" color="#1976D2" />
          <TouchableOpacity onPress={() => onChange("Wanita")}>
            <Text style={styles.radioLabel}>Wanita</Text>
          </TouchableOpacity>
        </View>
      </RadioButton.Group>
    </View>
  );
}

const styles = StyleSheet.create({
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
});