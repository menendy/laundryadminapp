import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";

interface ValidatedInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
}

export default function ValidatedInput({
  label,
  required = false,
  error,
  style,
  ...props
}: ValidatedInputProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#aaa"
        {...props}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
  },
});
