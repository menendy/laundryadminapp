import React, { useState } from "react";
import { View, Text, Pressable, Linking, ScrollView } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
// ✅ Import ToggleSwitch
import ToggleSwitch from "../../../../components/ui/ToggleSwitch"; 

export default function AddPageModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  
  const addDraft = usePagesAdminDraftStore((s) => s.addDraft);

  // ✅ State Baru
  const [active, setActive] = useState(true); // Default Aktif
  const [isSysadminOnly, setIsSysadminOnly] = useState(false); // Default Tidak (bisa dilihat owner)
  const [useRole, setUseRole] = useState(false); // Default Tidak

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("file-document-outline"); 
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    path?: string;
    component?: string;
  }>({});

  const incomingSort = params.sort ? Number(params.sort) : 9999;
  const parentId = params.parent_id || null;

  const handleSubmit = () => {
    const newErrors: { name?: string; path?: string; component?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Nama halaman wajib diisi";
      isValid = false;
    }
    if (!path.trim()) {
      newErrors.path = "Path wajib diisi";
      isValid = false;
    }
    if (!component.trim()) {
      newErrors.component = "Component wajib diisi";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // ✅ LOGIC can_view_by
    // Jika Sysadmin Only = Ya -> ['sysadmin']
    // Jika Sysadmin Only = Tidak -> ['sysadmin', 'owner']
    const canViewByArray = isSysadminOnly ? ["sysadmin"] : ["sysadmin", "owner"];

    addDraft({
      id: "TMP_PAGE_" + Date.now(),
      type: "page",
      name: name.trim(),
      icon: icon.trim() || "file-document-outline",
      path: path.trim(),
      component: component.trim() || "",
      parent_id: parentId,
      sort: incomingSort,
      level: 0,
      is_expandable: false,
      
      // ✅ Field Baru
      active: active,
      useRole: useRole,
      can_view_by: canViewByArray,
      
      permissions_type: {},
      children: []
    } as any);

    router.back();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Card style={{ padding: 20, borderRadius: 16, backgroundColor: "#fff", maxHeight: '90%' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
            Tambah Halaman
            </Text>

            {/* ✅ 1. STATUS AKTIF (DIATAS NAMA) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <ToggleSwitch value={active} onChange={setActive} />
                <Text style={{ marginLeft: 10, fontSize: 14, fontWeight: '500', color: '#334155' }}>
                    {active ? "Status: Aktif" : "Status: Nonaktif"}
                </Text>
            </View>

            <ValidatedInput
            label="Nama Halaman"
            required
            placeholder="Contoh: Data User"
            value={name}
            onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            />

            {/* Icon Input & Preview */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <ValidatedInput
                        label="Icon (MaterialCommunityIcons)"
                        placeholder="Contoh: file-table"
                        value={icon}
                        onChangeText={setIcon}
                    />
                    <Pressable onPress={() => Linking.openURL('https://icons.expo.fyi/Index')}>
                        <Text style={{ fontSize: 12, color: '#2563eb', marginTop: -8, marginBottom: 12 }}>
                            Cari nama icon di sini
                        </Text>
                    </Pressable>
                </View>
                <View style={{ width: 50, height: 50, backgroundColor: "#f1f5f9", borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 12 }}>
                    <MaterialCommunityIcons name={icon as any} size={28} color="#334155" />
                </View>
            </View>

            <ValidatedInput
            label="Path"
            required
            placeholder="Contoh: /users"
            value={path}
            onChangeText={(text) => {
                setPath(text);
                if (errors.path) setErrors((prev) => ({ ...prev, path: undefined }));
            }}
            error={errors.path}
            />

            <ValidatedInput
            label="Component"
            required
            placeholder="Contoh: Data User"
            value={component}
            onChangeText={(text) => {
                setComponent(text);
                if (errors.component) setErrors((prev) => ({ ...prev, component: undefined }));
            }}
            error={errors.component}
            />

            {/* ✅ 2. OPSI TAMBAHAN */}
            <View style={{ marginTop: 10, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, gap: 16 }}>
                
                {/* Sysadmin Only */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ fontWeight: '600', color: '#334155' }}>Hanya bisa dilihat dan diedit sysadmin?</Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                            {isSysadminOnly ? "Ya (Owner tidak bisa lihat)" : "Tidak (Owner bisa lihat)"}
                        </Text>
                    </View>
                    <ToggleSwitch value={isSysadminOnly} onChange={setIsSysadminOnly} />
                </View>

                {/* Use Role */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ fontWeight: '600', color: '#334155' }}>Perlu pengaturan Role?</Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                            {useRole ? "Ya (Butuh setting role)" : "Tidak (Akses umum)"}
                        </Text>
                    </View>
                    <ToggleSwitch value={useRole} onChange={setUseRole} />
                </View>

            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20, alignItems: "center" }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 10 }}>
                <Text>Batal</Text>
            </Pressable>

            <Pressable
                onPress={handleSubmit}
                style={{ backgroundColor: "#2563eb", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 }}
            >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Tambah</Text>
            </Pressable>
            </View>
        </ScrollView>
      </Card>
    </View>
  );
}