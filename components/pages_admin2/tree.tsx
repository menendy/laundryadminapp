import React, { useState, memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Card, Portal, Dialog, Button, Text as PaperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    defaultAnimateLayoutChanges
} from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TreeNode } from "./state";
import { usePagesAdminDraftStore } from "../../store/usePagesAdminDraftStore.web";

function getPermissionEntries(permissions?: Record<string, string>) {
    if (!permissions) return [];
    return Object.entries(permissions).map(([url, permission]) => ({ url, permission }));
}

export const TreeItem = memo(function TreeItemComponent({ node, level }: { node: TreeNode; level: number }) {
    const router = useRouter();
    const { active, over } = useDndContext();

    const setUpdateSignal = usePagesAdminDraftStore((s) => s.setUpdateSignal);

    const [openMenu, setOpenMenu] = useState(false);
    const [openPermission, setOpenPermission] = useState(false);
    const [openAddMenuDialog, setOpenAddMenuDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<{ url: string; name: string } | null>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: node.id,
        data: node,
        animateLayoutChanges: (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
    });

    // --- 📐 LOGIKA VISUALISASI ---
    let visualMode: 'none' | 'top' | 'bottom' | 'nest' = 'none';

    if (active && over && over.id === node.id && active.id !== node.id) {
        const activeRect = active.rect.current.translated;
        const overRect = over.rect;

        if (activeRect && overRect) {
            const cursorY = activeRect.top + (activeRect.height / 2);
            const overTop = overRect.top;
            const overHeight = overRect.height;
            const overBottom = overTop + overHeight;
            const edgeZone = overHeight * 0.25;

            if (cursorY < overTop + edgeZone) {
                visualMode = 'top';
            } else if (cursorY > overBottom - edgeZone) {
                visualMode = 'bottom';
            } else {
                if (node.type === "menu") {
                    visualMode = 'nest';
                } else {
                    visualMode = 'bottom';
                }
            }
        }
    }

    // --- STYLE ---
    let cardStyle: any = {
        marginVertical: 0,
        marginHorizontal: 12,
        borderRadius: 8,
        backgroundColor: node.type === "menu" ? "#f8fafc" : "#fff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        elevation: 1,
    };

    if (visualMode === 'nest') {
        cardStyle = { ...cardStyle, backgroundColor: "#dbeafe", borderColor: "#2563eb", borderWidth: 2 };
    } else if (visualMode === 'top') {
        cardStyle = { ...cardStyle, borderTopWidth: 4, borderTopColor: "#2563eb", backgroundColor: "#f1f5f9" };
    } else if (visualMode === 'bottom') {
        cardStyle = { ...cardStyle, borderBottomWidth: 4, borderBottomColor: "#2563eb", backgroundColor: "#f1f5f9" };
    }

    const dragStyle = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.0 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    const permissions = getPermissionEntries(node.permissions_type);

    const getNextChildSort = () => {
        if (!node.children || node.children.length === 0) return 1;
        return Math.max(...node.children.map(c => Number(c.sort || 0))) + 1;
    };

    // HANDLER: DELETE NODE
    const handleDeleteNode = () => {
        setUpdateSignal({
            updatedType: "delete_item",
            updatedId: node.id
        });
        setOpenDeleteDialog(false);
    };

    // HANDLER: DELETE PERMISSION
    const handleConfirmDeletePermission = () => {
        if (!permissionToDelete) return;
        setUpdateSignal({
            updatedType: "delete_permission",
            updatedId: node.id,
            updatedUrl: permissionToDelete.url
        });
        setPermissionToDelete(null);
    };

    return (
        <View ref={setNodeRef} style={[{ paddingLeft: level * 24, marginBottom: 12, width: '100%' }, dragStyle]}>
            <Card style={cardStyle}>
                <Pressable
                    onPress={() => node.type === "menu" ? setOpenMenu(!openMenu) : setOpenPermission(!openPermission)}
                    style={{ flexDirection: "row", paddingVertical: 12, paddingHorizontal: 14, alignItems: "center", minHeight: 56 }}
                >
                    {/* 1. DRAG HANDLE */}
                    <View {...attributes} {...listeners} style={{ padding: 4, marginRight: 8, cursor: isDragging ? "grabbing" : "grab" }}>
                        <MaterialCommunityIcons name="drag" size={24} color="#94a3b8" />
                    </View>

                    {/* 2. ICON UTAMA (CUSTOM vs DEFAULT) */}
                    <View style={{ width: 32, alignItems: 'center', marginRight: 8 }}>
                        <MaterialCommunityIcons
                            name={
                                node.icon
                                    ? (node.icon as any)
                                    : (node.type === "menu" ? (openMenu ? "folder-open" : "folder") : "file-document-outline")
                            }
                            size={24}
                            color={node.type === "menu" ? "#3b82f6" : "#64748b"}
                        />
                    </View>

                    {/* 3. NAMA */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 15, color: "#1e293b" }}>{node.name}</Text>
                    </View>

                    {/* 4. ACTIONS */}
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {(node.type === "menu" || node.type === "page") && (
                            <Pressable onPress={e => { e.stopPropagation(); node.type === "menu" ? setOpenAddMenuDialog(true) : router.push({ pathname: "/pages_admin2/add/modal/permission", params: { page_id: node.id } }); }} style={{ padding: 8 }}>
                                <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#64748b" />
                            </Pressable>
                        )}

                        <Pressable
                            onPress={e => {
                                e.stopPropagation();
                                node.type === "menu"
                                    ? router.push({
                                        pathname: "/pages_admin2/edit/modal/menu",
                                        params: {
                                            id: node.id,
                                            name: node.name || "",
                                            // ✅ TAMBAHKAN BARIS INI:
                                            icon: node.icon || ""
                                        }
                                    })
                                    : router.push({
                                        pathname: "/pages_admin2/edit/modal/page",
                                        params: {
                                            id: node.id,
                                            name: node.name || "",
                                            icon: node.icon || "",
                                            path: node.path || "",
                                            component: node.component || "",
                                            active: String(node.active ?? true), // Convert ke string utk keamanan URL
                                            useRole: String(node.useRole ?? false),
                                            can_view_by: node.can_view_by || []
                                        }
                                    });
                            }}
                            style={{ padding: 8 }}
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color="#64748b" />
                        </Pressable>

                        <Pressable onPress={e => { e.stopPropagation(); setOpenDeleteDialog(true); }} style={{ padding: 8 }}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                        </Pressable>

                        <MaterialCommunityIcons name={node.type === "menu" ? (openMenu ? "chevron-up" : "chevron-down") : (openPermission ? "chevron-up" : "chevron-down")} size={24} color="#cbd5e1" />
                    </View>
                </Pressable>

                {/* LIST PERMISSION */}
                {node.type === "page" && openPermission && permissions.map((p, i) => (
                    <View key={i} style={{ padding: 12, paddingLeft: 56, borderTopWidth: 1, borderTopColor: "#f1f5f9", flexDirection: "row", alignItems: "center", backgroundColor: "#fafafa" }}>
                        <View style={{ flex: 1 }}><Text style={{ fontSize: 13, color: "#475569" }}>{p.permission}</Text></View>

                        <Pressable onPress={() => router.push({ pathname: "/pages_admin2/edit/modal/permission", params: { id: node.id, permission: p.permission, url: p.url, oldUrl: p.url } })} style={{ marginRight: 12 }}>
                            <MaterialCommunityIcons name="pencil" size={16} color="#94a3b8" />
                        </Pressable>

                        <Pressable onPress={() => setPermissionToDelete({ url: p.url, name: p.permission })}>
                            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
                        </Pressable>
                    </View>
                ))}
            </Card>

            {/* CHILDREN RECURSIVE */}
            {node.type === "menu" && openMenu && node.children && (
                <View style={{ marginTop: 8 }}>
                    <SortableContext items={node.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {node.children.map(child => <TreeItem key={child.id} node={child} level={level + 1} />)}
                    </SortableContext>
                </View>
            )}



            {/* Dialog Add Menu (UPDATED STYLE) */}
            <Portal>
                <Dialog
                    visible={openAddMenuDialog}
                    onDismiss={() => setOpenAddMenuDialog(false)}
                    style={{
                        backgroundColor: 'white',
                        width: 380,
                        alignSelf: 'center',
                        borderRadius: 20
                    }}
                >
                    <Dialog.Title style={{ color: '#0f172a', textAlign: 'center', fontWeight: 'bold' }}>
                        Tambah ke: {node.name}
                    </Dialog.Title>

                    <Dialog.Content>
                        <PaperText
                            variant="bodyMedium"
                            style={{ color: '#64748b', textAlign: 'center', marginBottom: 10 }}
                        >
                            Silakan pilih jenis item yang ingin Anda tambahkan ke dalam menu ini.
                        </PaperText>
                    </Dialog.Content>

                    <Dialog.Actions
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            paddingBottom: 20,
                            paddingHorizontal: 20
                        }}
                    >
                        {/* Tombol Tambah Sub Menu (Primary) */}
                        <Button
                            mode="contained"
                            onPress={() => {
                                setOpenAddMenuDialog(false);
                                router.push({
                                    pathname: "/pages_admin2/add/modal/menu",
                                    params: { parent_id: node.id, sort: getNextChildSort() }
                                });
                            }}
                            style={{ width: '100%', marginBottom: 10, borderRadius: 10 }}
                            buttonColor="#0284c7"
                        >
                            Sub Menu
                        </Button>

                        {/* Tombol Tambah Page (Secondary/Outlined) */}
                        <Button
                            mode="outlined"
                            onPress={() => {
                                setOpenAddMenuDialog(false);
                                router.push({
                                    pathname: "/pages_admin2/add/modal/page",
                                    params: { parent_id: node.id, sort: getNextChildSort() }
                                });
                            }}
                            style={{ width: '100%', borderRadius: 10 }}
                            textColor="#0284c7"
                        >
                            Page
                        </Button>

                        {/* Tombol Batal */}
                        <Button
                            onPress={() => setOpenAddMenuDialog(false)}
                            textColor="#94a3b8"
                            style={{ marginTop: 10 }}
                        >
                            Batal
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* DELETE NODE DIALOG */}
            <Portal>
                <Dialog
                    visible={openDeleteDialog}
                    onDismiss={() => setOpenDeleteDialog(false)}
                    style={{ backgroundColor: 'white', width: 380, alignSelf: 'center', borderRadius: 20 }}
                >
                    <Dialog.Title style={{ color: '#ef4444', textAlign: 'center' }}>Hapus Item?</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium" style={{ color: '#334155', lineHeight: 22, textAlign: 'center' }}>
                            Apakah Anda yakin ingin menghapus <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{node.name}</Text>?
                        </PaperText>
                        {node.type === 'menu' && node.children && node.children.length > 0 && (
                            <PaperText variant="bodySmall" style={{ marginTop: 12, color: '#ef4444', lineHeight: 20, textAlign: 'center' }}>
                                ⚠️ Peringatan: Semua sub-menu dan halaman di dalamnya juga akan terhapus.
                            </PaperText>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 15 }}>
                        <Button onPress={() => setOpenDeleteDialog(false)} textColor="#64748b">Batal</Button>
                        <Button onPress={handleDeleteNode} textColor="#ef4444">Hapus</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* DELETE PERMISSION DIALOG */}
            <Portal>
                <Dialog
                    visible={!!permissionToDelete}
                    onDismiss={() => setPermissionToDelete(null)}
                    style={{ backgroundColor: 'white', width: 380, alignSelf: 'center', borderRadius: 20 }}
                >
                    <Dialog.Title style={{ color: '#ef4444', textAlign: 'center' }}>Hapus Permission?</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium" style={{ color: '#334155', lineHeight: 22, textAlign: 'center' }}>
                            Apakah Anda yakin ingin menghapus permission <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{permissionToDelete?.name}</Text>?
                        </PaperText>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 15 }}>
                        <Button onPress={() => setPermissionToDelete(null)} textColor="#64748b">Batal</Button>
                        <Button onPress={handleConfirmDeletePermission} textColor="#ef4444">Hapus</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

        </View>
    );
});