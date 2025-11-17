import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Text, Card, Portal, Modal } from "react-native-paper";

interface ItemType {
  label: string;
  value: string;
}

export default function AppAutocomplete({
  label,
  placeholder,
  items,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  items: ItemType[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: "600", marginBottom: 6 }}>{label}</Text>

      {/* INPUT */}
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
        <Text style={{ color: value ? "#000" : "#777" }}>
          {value
            ? items.find((i) => i.value === value)?.label
            : placeholder || "Pilih..."}
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
            keyExtractor={(i) => `key-${i.value.toLowerCase()}`}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
              >
                <Card style={{ marginBottom: 6 }}>
                  <Card.Content>
                    <Text>{item.label}</Text>
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
