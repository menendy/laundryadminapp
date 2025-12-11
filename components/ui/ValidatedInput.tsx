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
  const isMultiline = props.multiline === true;

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>

      <View
        style={[
          styles.container,
          error && styles.errorBorder,
          !editable && styles.disabledContainer,

          // FIX MULTILINE LAYOUT
          isMultiline && {
            alignItems: "flex-start",
            height: "auto",
            minHeight: 52,
            paddingTop: 12,
            paddingBottom: 12,
          },
        ]}
      >
        {prefix && !isMultiline && (
          <View style={styles.prefixBox}>
            {typeof prefix === "string" || typeof prefix === "number" ? (
              <Text style={styles.prefixText}>{prefix}</Text>
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

            // FIX MULTILINE TEXT ALIGN
            isMultiline && { textAlignVertical: "top" },
          ]}
          placeholderTextColor="#999"
          editable={editable}
          {...props}
        />
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  required: {
    color: "red",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#C9CED6",
    backgroundColor: "#fff",
    height: 52, // default height untuk single-line
    overflow: "hidden",
  },
  prefixBox: {
    paddingHorizontal: 14,
    backgroundColor: "#ECEFF1",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#C9CED6",
    height: "100%",
  },
  prefixText: {
    fontSize: 16,
    color: "#555",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  errorBorder: {
    borderColor: "#D32F2F",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#D32F2F",
  },
  disabledContainer: {
    backgroundColor: "#EEE",
    borderColor: "#BBB",
  },
  disabledText: {
    color: "#777",
  },
});
