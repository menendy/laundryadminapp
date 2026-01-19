import React, { useState, useEffect } from "react";
// ✅ 1. Pastikan import Platform dan useWindowDimensions ada
import { View, ScrollView, Text, Pressable, Platform, useWindowDimensions } from "react-native";
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

// 👇 IMPORT TAMBAHAN PENTING
import { useQueryClient } from "@tanstack/react-query"; 

import AppHeaderList from "../../components/ui/AppHeaderList";
import { TreeItem } from "../../components/pages_admin2/tree";
import { usePagesAdminState } from "../../components/pages_admin2/state";
import { usePagesAdminDraftStore } from "../../store/usePagesAdminDraftStore.web";

import { savePagesAdminStructure } from "../../services/api/pagesAdminService2";
import { handleBackendError } from "../../utils/handleBackendError";
import { useSnackbarStore } from "../../store/useSnackbarStore";

export default function PagesAdmin2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  
  // 👇 2. AMBIL INSTANCE QUERY CLIENT (Sama dengan yg di _layout.tsx)
  const queryClient = useQueryClient();
  
  // ✅ 2. DETEKSI PLATFORM & UKURAN LAYAR
  const { width } = useWindowDimensions();
  
  // Deteksi jika aplikasi berjalan di Android atau iOS (Native)
  const isNativeApp = Platform.OS === 'ios' || Platform.OS === 'android';

  // Deteksi jika browser web tapi layarnya kecil (Mobile Web)
  const isSmallWeb = Platform.OS === 'web' && width < 768; 

  // ✅ 3. LOGIKA BLOCKER (EARLY RETURN)
  if (isNativeApp || isSmallWeb) {
     return (
        <View style={{ flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <View style={{ 
                backgroundColor: "white", 
                padding: 30, 
                borderRadius: 20, 
                alignItems: "center", 
                elevation: 4, 
                shadowColor: "#000", 
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                maxWidth: 400,
                width: '100%'
            }}>
                <MaterialCommunityIcons name="monitor-screenshot" size={64} color="#cbd5e1" style={{ marginBottom: 20 }} />
                
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#1e293b", textAlign: "center", marginBottom: 10 }}>
                    Hanya Tersedia di Desktop
                </Text>
                
                <Text style={{ fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22, marginBottom: 24 }}>
                 Mohon akses halaman ini melalui Laptop atau PC menggunakan Web Browser untuk pengalaman terbaik.
                </Text>

                <Button 
                    mode="contained" 
                    onPress={() => router.back()} 
                    buttonColor="#2563eb"
                    style={{ borderRadius: 8, width: "100%" }}
                >
                    Kembali
                </Button>
            </View>
        </View>
     );
  }

  // =====================================================================
  // KODE WEB DESKTOP
  // =====================================================================

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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
        
        const HEADER_HEIGHT = 60; 

        const isTopEdge = activeCenterY < (overTop + 15);
        let isBottomEdge = false;
        
        if (overHeight > HEADER_HEIGHT * 1.5) {
            isBottomEdge = activeCenterY > (overTop + HEADER_HEIGHT);
        } else {
            isBottomEdge = activeCenterY > (overBottom - 15);
        }

        if (overItem.type === "menu") {
            if (!isTopEdge && !isBottomEdge) {
                targetParentId = overItem.id;
            }
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

  const handleSubmit = async () => {
    setSubmitLoading(true);

    try {
      console.log("🚀 Menyimpan data struktur...");
      
      const cleanItems = items.map(item => {
        const { children, ...rest } = item; 
        if (rest.type === 'menu') { delete rest.permissions_type; delete rest.component; }
        if (rest.type === 'page' && !rest.permissions_type) { rest.permissions_type = {}; }
        return rest;
      });

      const result = await savePagesAdminStructure(cleanItems);

      const ok = handleBackendError(result, null, showSnackbar);
      
      if (ok) {
        showSnackbar("Struktur berhasil disimpan!", "success");
        setDirty(false);

        // 🔥 3. INVALIDASI CACHE GLOBAL
        // Ini memaksa React Query membuang semua data lama dan fetch ulang dari server.
        // Hasilnya: RBAC check akan tereksekusi ulang di backend untuk semua halaman.
        await queryClient.invalidateQueries(); 
        console.log("♻️ Cache invalidated globally!");
      }

    } catch (err: any) {
      console.error("🔥 Error saving structure:", err);
      handleBackendError(err, null, showSnackbar);
    } finally {
      setSubmitLoading(false);
    }
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
            disabled={submitLoading}
            style={{
              backgroundColor: submitLoading ? "#93c5fd" : "#2563eb",
              paddingHorizontal: 22,
              paddingVertical: 14,
              borderRadius: 28,
              flexDirection: "row",
              elevation: 4,
              alignItems: "center"
            }}
          >
            {submitLoading ? (
               <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            ) : (
               <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
            )}
            
            <Text style={{ color: "#fff", marginLeft: submitLoading ? 0 : 8, fontWeight: "700" }}>
                {submitLoading ? "Menyimpan..." : "Simpan Struktur"}
            </Text>
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
                buttonColor="#0284c7" 
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