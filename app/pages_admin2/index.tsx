import React, { useState } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { ActivityIndicator, Portal, Dialog, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { 
  DndContext, 
  closestCenter, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor 
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  arrayMove, 
  sortableKeyboardCoordinates 
} from "@dnd-kit/sortable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppHeaderList from "../../components/ui/AppHeaderList";
import { TreeItem } from "./tree";
import { usePagesAdminState } from "./state";

export default function PagesAdmin2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const { items, tree, loading, dirty, setDirty, setItems } = usePagesAdminState();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ✅ LOGIC BARU: Handle Drag End dengan Grouping Sort
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDirty(true);

    setItems((prevItems: any[]) => {
      const oldIndex = prevItems.findIndex((i) => i.id === active.id);
      const newIndex = prevItems.findIndex((i) => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevItems;

      // 1. Pindahkan posisi item di array flat
      const reordered = arrayMove(prevItems, oldIndex, newIndex);

      // 2. Siapkan penghitung (counter) untuk setiap grup parent
      // Key: parent_id (atau "root"), Value: urutan terakhir
      const sortCounters: Record<string, number> = {};

      // 3. Loop ulang seluruh item untuk update sort berdasarkan grupnya
      return reordered.map((item) => {
        // Grupkan berdasarkan parent_id. Jika null, masuk grup "root"
        const groupKey = item.parent_id || "root";

        // Jika grup ini belum ada di counter, inisialisasi dengan 1
        if (!sortCounters[groupKey]) {
          sortCounters[groupKey] = 1;
        }

        // Ambil urutan saat ini untuk item tersebut
        const newSort = sortCounters[groupKey];

        // Tambahkan counter untuk item berikutnya di grup yang sama
        sortCounters[groupKey]++;

        return {
          ...item,
          sort: newSort, // Assign sort yang benar (1, 2, 3... per folder)
        };
      });
    });
  };

  const handleSubmit = () => {
    console.log("🚀 DATA SIAP DIKIRIM KE API:", JSON.stringify(items, null, 2));
    setDirty(false);
  };

  // ✅ FUNGSI HITUNG SORT ROOT (STRICT)
  const getNextRootSort = () => {
    const rootItems = items.filter(i => !i.parent_id); 
    if (rootItems.length === 0) return 1;
    const maxSort = Math.max(...rootItems.map(i => Number(i.sort || 0)));
    return maxSort + 1;
  };

  const rootItemIds = items.filter(i => !i.parent_id).map(i => i.id);

  return (
    <View style={{ flex: 1 }}>
      <AppHeaderList
        title="Struktur Halaman Admin"
        onAdd={() => setOpenAddDialog(true)}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
            <SortableContext 
              items={rootItemIds} 
              strategy={verticalListSortingStrategy}
            >
              {tree.map(node => (
                <TreeItem key={node.id} node={node} level={0} />
              ))}
            </SortableContext>
          </ScrollView>
        </DndContext>
      )}

      {dirty && (
        <View style={{ position: "absolute", bottom: insets.bottom + 72, right: 20 }}>
          <Pressable
            onPress={handleSubmit}
            style={{
              backgroundColor: "#2563eb",
              paddingHorizontal: 22,
              paddingVertical: 14,
              borderRadius: 28,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "700" }}>Simpan</Text>
          </Pressable>
        </View>
      )}

      <Portal>
        <Dialog visible={openAddDialog} onDismiss={() => setOpenAddDialog(false)}>
          <Dialog.Title>Tambah Struktur</Dialog.Title>
          <Dialog.Actions>
            <Button
              onPress={() => {
                const nextSort = getNextRootSort();
                setOpenAddDialog(false);
                router.push({
                  pathname: "/pages_admin2/add/modal/menu",
                  params: { sort: nextSort }
                });
              }}
            >
              Tambah Menu
            </Button>
            <Button
              onPress={() => {
                const nextSort = getNextRootSort();
                setOpenAddDialog(false);
                router.push({
                  pathname: "/pages_admin2/add/modal/page",
                  params: { sort: nextSort }
                });
              }}
            >
              Tambah Page
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}