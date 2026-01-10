import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { ActivityIndicator, Portal, Dialog, Button, Text as PaperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { 
  DndContext, 
  closestCorners, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  MeasuringStrategy
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
import { usePagesAdminDraftStore } from "../../store/usePagesAdminDraftStore.web";

export default function PagesAdmin2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const { items, tree, loading, dirty, setDirty, setItems } = usePagesAdminState();
  const { setUpdateSignal } = usePagesAdminDraftStore();

  useEffect(() => {
    return () => { setUpdateSignal(null); };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDirty(true);

    setItems((prevItems: any[]) => {
      const oldIndex = prevItems.findIndex((i) => i.id === active.id);
      const newIndex = prevItems.findIndex((i) => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevItems;

      const overItem = prevItems[newIndex];
      const reordered = arrayMove(prevItems, oldIndex, newIndex);
      const sortCounters: Record<string, number> = {};

      /* --- 📐 LOGIKA BARU: HEADER-BASED ZONE --- */
      let targetParentId = overItem.parent_id;

      if (active.rect.current.translated && over.rect) {
        const activeCenterY = active.rect.current.translated.top + (active.rect.current.translated.height / 2);
        
        const overTop = over.rect.top;
        const overHeight = over.rect.height;
        const overBottom = overTop + overHeight;
        
        // Konstanta Tinggi Header Kartu (Estimasi Visual)
        const HEADER_HEIGHT = 60; 

        // 1. Deteksi Top Edge (Insert Above) - Fixed 15px
        const isTopEdge = activeCenterY < (overTop + 15);

        // 2. Deteksi Bottom Edge (Insert Below)
        // Jika Item Tinggi (Expanded), maka semua area DI BAWAH Header adalah "Bottom Edge"
        let isBottomEdge = false;
        
        if (overHeight > HEADER_HEIGHT * 1.5) {
            // Kasus Expanded: Jika kursor di bawah Header -> Anggap Bottom (Keluar/Sibling)
            isBottomEdge = activeCenterY > (overTop + HEADER_HEIGHT);
        } else {
            // Kasus Collapsed: Cek 15px dari bawah
            isBottomEdge = activeCenterY > (overBottom - 15);
        }

        // 3. Logic Nesting (Hanya jika Target MENU dan Kursor di Zona Header)
        if (overItem.type === "menu") {
            if (!isTopEdge && !isBottomEdge) {
                targetParentId = overItem.id; // Masuk Folder
            }
            // Jika isBottomEdge = true pada menu expanded, dia akan skip blok ini
            // dan targetParentId tetap overItem.parent_id (Sibling/Keluar)
        }
      }
      /* -------------------------------------- */

      return reordered.map((item) => {
        let currentParentId = item.parent_id;

        if (item.id === active.id) {
            currentParentId = targetParentId;
        }

        const groupKey = currentParentId || "root";
        if (!sortCounters[groupKey]) sortCounters[groupKey] = 1;
        const newSort = sortCounters[groupKey]++;

        return {
          ...item,
          parent_id: currentParentId,
          sort: newSort,
        };
      });
    });
  };

  const handleSubmit = () => {
    console.log("🚀 DATA SIAP DIKIRIM KE API:", JSON.stringify(items, null, 2));
    setDirty(false);
  };

  const getNextRootSort = () => {
    const rootItems = items.filter(i => !i.parent_id); 
    if (rootItems.length === 0) return 1;
    const maxSort = Math.max(...rootItems.map(i => Number(i.sort || 0)));
    return maxSort + 1;
  };

  const rootItemIds = items.filter(i => !i.parent_id).map(i => i.id);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <AppHeaderList
        title="Struktur Halaman Admin"
        onAdd={() => setOpenAddDialog(true)}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners} 
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            }
          }}
          onDragEnd={handleDragEnd}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 160, paddingTop: 20 }}>
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
              elevation: 4
            }}
          >
            <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "700" }}>Simpan Struktur</Text>
          </Pressable>
        </View>
      )}

      <Portal>
  <Dialog
    visible={openAddDialog}
    onDismiss={() => setOpenAddDialog(false)}
    style={{ backgroundColor: 'white', width: 380, alignSelf: 'center', borderRadius: 20}}
  >
    <Dialog.Title style={{ color: '#0f172a', textAlign: 'center', fontWeight: 'bold' }}>
      Tambah Struktur
    </Dialog.Title>

    <Dialog.Content>
      <PaperText
        variant="bodyMedium"
        style={{ color: '#64748b', textAlign: 'center', marginBottom: 10 }}
      >
        Silakan pilih jenis struktur baru yang ingin Anda tambahkan di tingkat utama.
      </PaperText>
    </Dialog.Content>

    <Dialog.Actions
      style={{ flexDirection: 'column', justifyContent: 'center', paddingBottom: 20, paddingHorizontal: 20, }}
    >
      <Button
        mode="contained"
        onPress={() => {
          const nextSort = getNextRootSort();
          setOpenAddDialog(false);
          router.push({
            pathname: "/pages_admin2/add/modal/menu",
            params: { sort: nextSort }
          });
        }}
        style={{ width: '100%', marginBottom: 10, borderRadius: 10 }}
        buttonColor="#0284c7" // Warna biru untuk aksi positif
      >
        Tambah Menu
      </Button>

      <Button
        mode="outlined"
        onPress={() => {
          const nextSort = getNextRootSort();
          setOpenAddDialog(false);
          router.push({
            pathname: "/pages_admin2/add/modal/page",
            params: { sort: nextSort }
          });
        }}
        style={{ width: '100%', borderRadius: 10 }}
        textColor="#0284c7"
      >
        Tambah Halaman
      </Button>
      
      <Button 
        onPress={() => setOpenAddDialog(false)} 
        textColor="#94a3b8"
        style={{ marginTop: 10 }}
      >
        Batal
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
    </View>
  );
}