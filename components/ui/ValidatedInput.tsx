import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";

export interface ValidatedInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  prefix?: React.ReactNode;
}

export default function ValidatedInput({
  label,
  required = false,
  error,
  style,
  prefix,
  editable = true,
  ...props
}: ValidatedInputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          error && styles.inputError,
          !editable && styles.disabledWrapper,
        ]}
      >
        {prefix && (
          <View style={styles.prefixWrapper}>
            {typeof prefix === "string" || typeof prefix === "number" ? (
              <Text>{prefix}</Text>
            ) : (
              prefix
            )}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            style,
            !editable && styles.disabledText,
          ]}
          placeholderTextColor="#999"
          editable={editable}
          {...props}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  required: {
    color: "red",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  disabledWrapper: {
    backgroundColor: "#e5e5e5",
    borderColor: "#bbb",
  },
  prefixWrapper: {
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    height: "100%",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  disabledText: {
    color: "#666",
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
