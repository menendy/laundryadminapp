import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { getPendingOwners, activateOwner } from "../../services/api/ownerService";

export default function OwnerListPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const r = await getPendingOwners();
    if (r.success) setList(r.data);
  };

  const handleActivate = async (uid: string) => {
    const r = await activateOwner(uid);
    if (r.success) {
      alert("Owner berhasil diaktifkan");
      loadData();
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      {list.map((o) => (
        <Card key={o.uid} style={{ marginBottom: 10 }}>
          <Card.Content>
            <Text variant="titleMedium">{o.name}</Text>
            <Text>Email: {o.email}</Text>
            <Text>Phone: {o.phone}</Text>

            <Button
              mode="contained"
              style={{ marginTop: 10 }}
              onPress={() => handleActivate(o.uid)}
            >
              Aktifkan Owner
            </Button>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
