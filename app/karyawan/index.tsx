import React from "react";
import { View, ScrollView } from "react-native";
import { Avatar, Button, Card, Text, List } from "react-native-paper";
import { useRouter } from "expo-router";
import AppHeaderList from "../../components/ui/AppHeaderList";
import { useKaryawanStore } from "../../store/useKaryawanStore";

export default function KaryawanList() {
  const router = useRouter();
  const { karyawan, removeKaryawan } = useKaryawanStore();

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* ✅ Header dengan tombol search, add, filter */}
      <AppHeaderList
        title="Data Karyawan"
        onSearch={() => console.log("Search pressed")}
        onAdd={() => router.push("/karyawan/add")}
        onFilter={() => console.log("Filter pressed")}
      />

      {/* ✅ List View */}
      <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
        {karyawan.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
            Belum ada data karyawan
          </Text>
        ) : (
          karyawan.map((k) => (
            <Card
              key={k.id}
              mode="contained"
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#f0f0f0",
              }}
            >
              <List.Item
                title={() => (
                  <Text style={{ fontWeight: "700", fontSize: 16 }}>{k.nama}</Text>
                )}
                description={() => (
                  <>
                    <Text style={{ fontWeight: "600", color: "#444" }}>
                      {k.posisi} Laundryinnaja HO
                    </Text>
                    {k.role && (
                      <Text style={{ color: "#555", marginTop: 2 }}>
                        Sebagai {k.role}
                      </Text>
                    )}
                    <Text style={{ color: "#888", marginTop: 4, fontSize: 12 }}>
                      ID: {k.id}
                    </Text>
                  </>
                )}
                left={(props) =>
                  k.avatarUrl ? (
                    <Avatar.Image {...props} source={{ uri: k.avatarUrl }} />
                  ) : (
                    <Avatar.Text {...props} label={k.nama?.[0]?.toUpperCase() || "?"} />
                  )
                }
                right={() => (
                  <View style={{ justifyContent: "center", alignItems: "center" }}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => {
                        // bisa arahkan ke edit page
                        router.push(`/karyawan/${k.id}`);
                      }}
                      style={{ borderColor: "#1976d2" }}
                      textColor="#1976d2"
                    >
                      Detail
                    </Button>
                  </View>
                )}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTopWidth: 1,
                  borderTopColor: "#f2f2f2",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Button
                  mode="text"
                  icon="content-copy"
                  onPress={() => {
                    navigator.clipboard.writeText(k.id);
                  }}
                  textColor="#1976d2"
                >
                  Salin ID
                </Button>

                <Button
                  mode="text"
                  icon="delete"
                  textColor="#d32f2f"
                  onPress={() => removeKaryawan(k.id)}
                >
                  Hapus
                </Button>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
