import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Card, Portal, Dialog, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TreeNode } from "./state";

function getPermissionEntries(permissions?: Record<string, string>) {
  if (!permissions) return [];
  return Object.entries(permissions).map(([url, permission]) => ({
    url,
    permission,
  }));
}

export function TreeItem({ node, level }: { node: TreeNode; level: number }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [openAddMenuDialog, setOpenAddMenuDialog] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });

  const dragStyle = Platform.OS === "web" ? {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  } : {};

  const permissions = getPermissionEntries(node.permissions_type);

  // --- LOGIC SORT UNTUK ADD ---
  const getNextChildSort = () => {
    if (!node.children || node.children.length === 0) return 1;
    const maxSort = Math.max(...node.children.map(c => Number(c.sort || 0)));
    return maxSort + 1;
  };

  // --- NAVIGASI ADD ---
  const goAddPage = () => {
    const nextSort = getNextChildSort();
    router.push({
      pathname: "/pages_admin2/add/modal/page",
      params: { parent_id: node.id, sort: nextSort },
    });
  };

  const goAddSubMenu = () => {
    const nextSort = getNextChildSort();
    router.push({
      pathname: "/pages_admin2/add/modal/menu",
      params: { parent_id: node.id, sort: nextSort },
    });
  };

  const goAddPermission = () => router.push({ pathname: "/pages_admin2/add/modal/permission", params: { page_id: node.id } });

  // --- NAVIGASI EDIT (PERBAIKAN DISINI) ---
  const goEditMenu = () => {
    router.push({
      pathname: "/pages_admin2/edit/modal/menu",
      params: { 
        id: node.id, 
        name: node.name || "" // Pastikan string
      } 
    });
  };

  const goEditPage = () => {
    router.push({
      pathname: "/pages_admin2/edit/modal/page",
      params: { 
        id: node.id, 
        name: node.name || "", 
        path: node.path || "",       // ✅ Cegah null
        component: node.component || "" // ✅ Cegah null
      } 
    });
  };

  const goEditPermission = (p: any) => {
    router.push({
      pathname: "/pages_admin2/edit/modal/permission",
      params: { 
        id: node.id, 
        permission: p.permission, 
        url: p.url, 
        oldUrl: p.url 
      } 
    });
  };

  return (
    <View ref={setNodeRef} style={[{ marginLeft: level * 14 }, dragStyle]}>
      <Card style={{ margin: 10, borderRadius: 16 }}>
        <Pressable
          onPress={() => node.type === "menu" ? setOpenMenu(v => !v) : setOpenPermission(v => !v)}
          style={{ flexDirection: "row", padding: 16, alignItems: "center" }}
        >
          <View {...attributes} {...listeners} style={{ padding: 10, cursor: isDragging ? "grabbing" : "grab" }}>
            <MaterialCommunityIcons name="drag" size={22} color="#888" />
          </View>
          <MaterialCommunityIcons name={node.type === "menu" ? "folder-outline" : "file-document-outline"} size={22} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700" }}>{node.name}</Text>
          </View>
          
          {(node.type === "menu" || node.type === "page") && (
            <Pressable onPress={e => { e.stopPropagation(); node.type === "menu" ? setOpenAddMenuDialog(true) : goAddPermission(); }} style={{ padding: 6 }}>
              <MaterialCommunityIcons name="plus-circle-outline" size={22} />
            </Pressable>
          )}

          <Pressable onPress={e => { e.stopPropagation(); node.type === "menu" ? goEditMenu() : goEditPage(); }} style={{ paddingHorizontal: 6 }}>
            <MaterialCommunityIcons name="pencil-outline" size={22} />
          </Pressable>
          <MaterialCommunityIcons name={node.type === "menu" ? (openMenu ? "chevron-up" : "chevron-down") : (openPermission ? "chevron-up" : "chevron-down")} size={26} />
        </Pressable>

        {node.type === "page" && openPermission && permissions.map((p, i) => (
           <View key={i} style={{ padding: 12, borderTopWidth: 1, borderTopColor: "#eee", flexDirection: "row", alignItems: "center" }}>
             <View style={{ flex: 1 }}><Text>{p.permission}</Text></View>
             <Pressable onPress={() => goEditPermission(p)}><MaterialCommunityIcons name="pencil-outline" size={18} /></Pressable>
           </View>
        ))}
      </Card>

      {node.type === "menu" && openMenu && (
        <SortableContext items={node.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {node.children.map(child => <TreeItem key={child.id} node={child} level={level + 1} />)}
        </SortableContext>
      )}

      <Portal>
        <Dialog visible={openAddMenuDialog} onDismiss={() => setOpenAddMenuDialog(false)}>
          <Dialog.Title>Tambah ke Menu</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => { setOpenAddMenuDialog(false); goAddSubMenu(); }}>Sub Menu</Button>
            <Button onPress={() => { setOpenAddMenuDialog(false); goAddPage(); }}>Halaman</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}