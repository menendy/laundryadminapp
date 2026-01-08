// app/pages_admin2/tree.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import {
  Card,
  Portal,
  Dialog,
  Button,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TreeNode } from "./state";

/* ================= PERMISSION HELPER ================= */

function getPermissionEntries(
  permissions?: Record<string, string>
): { url: string; permission: string }[] {
  if (!permissions) return [];
  return Object.entries(permissions).map(([url, permission]) => ({
    url,
    permission,
  }));
}

/* ================= TREE ITEM ================= */

export function TreeItem({
  node,
  level,
}: {
  node: TreeNode;
  level: number;
}) {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [openAddMenuDialog, setOpenAddMenuDialog] = useState(false);

  const permissions = getPermissionEntries(node.permissions_type);

  /* ===== NAVIGATION HANDLER (JANGAN DIPINDAH) ===== */

  const goAddPage = () =>
    router.push({
      pathname: "/pages_admin2/add/modal/page",
      params: { parent_id: node.id },
    });

  const goAddSubMenu = () =>
    router.push({
      pathname: "/pages_admin2/add/modal/menu",
      params: { parent_id: node.id },
    });

  const goAddPermission = () =>
    router.push({
      pathname: "/pages_admin2/add/modal/permission",
      params: { page_id: node.id },
    });

  const goEditMenu = () =>
    router.push({
      pathname: "/pages_admin2/edit/modal/menu",
      params: { id: node.id, name: node.name },
    });

  const goEditPage = () =>
    router.push({
      pathname: "/pages_admin2/edit/modal/page",
      params: {
        id: node.id,
        name: node.name,
        path: node.path,
        component: node.component,
      },
    });

  const goEditPermission = (p: { permission: string; url: string }) =>
    router.push({
      pathname: "/pages_admin2/edit/modal/permission",
      params: {
        id: node.id,
        permission: p.permission,
        url: p.url,
        oldUrl: p.url,
      },
    });

  /* ===== DND ===== */

  const sortable =
    Platform.OS === "web"
      ? useSortable({
          id: node.id,
          data: { parent_id: node.parent_id ?? null },
        })
      : null;

  const dragStyle =
    sortable && Platform.OS === "web"
      ? {
          transform: CSS.Transform.toString(sortable.transform),
          opacity: sortable.isDragging ? 0.6 : 1,
          zIndex: sortable.isDragging ? 100 : 0,
        }
      : undefined;

  const isOpen = node.type === "menu" ? openMenu : openPermission;

  return (
    <View
      ref={el => {
        if (Platform.OS === "web" && el) {
          sortable?.setNodeRef(el as unknown as HTMLElement);
        }
      }}
      style={{ marginLeft: level * 14 }}
    >
      <Card style={[{ margin: 10, borderRadius: 16 }, dragStyle]}>
        <Pressable
          onPress={() =>
            node.type === "menu"
              ? setOpenMenu(v => !v)
              : setOpenPermission(v => !v)
          }
          style={{ flexDirection: "row", padding: 16, alignItems: "center" }}
        >
          {Platform.OS === "web" && (
            <Pressable
              {...sortable?.attributes}
              {...sortable?.listeners}
              style={{ padding: 12 }}
            >
              <MaterialCommunityIcons name="drag" size={22} color="#888" />
            </Pressable>
          )}

          <MaterialCommunityIcons
            name={node.type === "menu" ? "folder-outline" : "file-document-outline"}
            size={22}
            style={{ marginRight: 12 }}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700" }}>{node.name}</Text>
            {node.path && (
              <Text style={{ color: "#666" }}>Path: {node.path}</Text>
            )}
          </View>

          {node.type === "menu" && (
            <Pressable
              onPress={e => {
                e.stopPropagation();
                setOpenAddMenuDialog(true);
              }}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={22} />
            </Pressable>
          )}

          {node.type === "page" && (
            <Pressable
              onPress={e => {
                e.stopPropagation();
                goAddPermission();
              }}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={22} />
            </Pressable>
          )}

          <Pressable
            onPress={e => {
              e.stopPropagation();
              node.type === "menu" ? goEditMenu() : goEditPage();
            }}
            style={{ paddingHorizontal: 6 }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={22} />
          </Pressable>

          <MaterialCommunityIcons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={26}
          />
        </Pressable>

        {node.type === "page" &&
          openPermission &&
          permissions.map((p, i) => (
            <View
              key={i}
              style={{
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: "#eee",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600" }}>
                  Permission : {p.permission}
                </Text>
                <Text style={{ color: "#555" }}>URL : {p.url}</Text>
              </View>

              <Pressable onPress={() => goEditPermission(p)}>
                <MaterialCommunityIcons name="pencil-outline" size={20} />
              </Pressable>
            </View>
          ))}
      </Card>

      {node.type === "menu" && openMenu && node.children.length > 0 && (
        <SortableContext
          items={node.children.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map(child => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </SortableContext>
      )}

      <Portal>
        <Dialog
          visible={openAddMenuDialog}
          onDismiss={() => setOpenAddMenuDialog(false)}
        >
          <Dialog.Title>Tambah ke Menu</Dialog.Title>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setOpenAddMenuDialog(false);
                goAddSubMenu();
              }}
            >
              Tambah Sub Menu
            </Button>
            <Button
              onPress={() => {
                setOpenAddMenuDialog(false);
                goAddPage();
              }}
            >
              Tambah Halaman
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
