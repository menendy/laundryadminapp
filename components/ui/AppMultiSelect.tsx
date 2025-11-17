import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Text, Card, Portal, Modal, Checkbox } from "react-native-paper";

export default function AppMultiSelect({
  label,
  placeholder,
  items,
  value,
  onChange,
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: "600", marginBottom: 6 }}>{label}</Text>

      {/* SELECT INPUT */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 14,
          borderRadius: 8,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ color: value.length ? "#000" : "#777" }}>
          {value.length
            ? items
                .filter((i) => value.includes(i.value))
                .map((i) => i.label)
                .join(", ")
            : placeholder}
        </Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={{
            margin: 20,
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <TextInput
            placeholder="Cari..."
            value={search}
            onChangeText={setSearch}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 15,
            }}
          />

          <FlatList
            data={filtered}
            keyExtractor={(i) => i.value}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggleValue(item.value)}>
                <Card style={{ marginBottom: 6 }}>
                  <Card.Content
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>{item.label}</Text>
                    <Checkbox
                      status={value.includes(item.value) ? "checked" : "unchecked"}
                    />
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            )}
          />
        </Modal>
      </Portal>
    </View>
  );
}
