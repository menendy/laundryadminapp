// app/pages_admin2/index.tsx
import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Pressable,
} from "react-native";
import {
  ActivityIndicator,
  Portal,
  Dialog,
  Button,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDirty(true);

    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id);
      const newIndex = prev.findIndex(i => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(prev, oldIndex, newIndex);

      return reordered.map((item, index) => ({
        ...item,
        sort: index + 1,
      }));
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeaderList
        title="Struktur Halaman Admin"
        onAdd={() => setOpenAddDialog(true)}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
            <SortableContext
              items={items.filter(i => !i.parent_id).map(i => i.id)}
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
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 72,
            right: 20,
          }}
        >
          <Pressable
            onPress={() => setDirty(false)}
            style={{
              backgroundColor: "#2563eb",
              paddingHorizontal: 22,
              paddingVertical: 14,
              borderRadius: 28,
              flexDirection: "row",
            }}
          >
            <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "700" }}>
              Simpan
            </Text>
          </Pressable>
        </View>
      )}

      <Portal>
        <Dialog visible={openAddDialog} onDismiss={() => setOpenAddDialog(false)}>
          <Dialog.Title>Tambah Struktur</Dialog.Title>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setOpenAddDialog(false);
                router.push("/pages_admin2/add/modal/menu");
              }}
            >
              Tambah Menu
            </Button>

            <Button
              onPress={() => {
                setOpenAddDialog(false);
                router.push("/pages_admin2/add/modal/page");
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