import React, { useState } from "react";
import { View, Text, Pressable, Linking, ScrollView } from "react-native";
import { Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import { usePagesAdminDraftStore } from "../../../../store/usePagesAdminDraftStore.web";
// ✅ Import ToggleSwitch
import ToggleSwitch from "../../../../components/ui/ToggleSwitch";

export default function EditPageModal() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const setUpdateSignal = usePagesAdminDraftStore((s) => s.setUpdateSignal);

  // --- Parsing Data Awal ---
  
  // 1. Parse Active (Biasanya string "true"/"false" dari params router)
  const initialActive = params.active === "true" || params.active === true;
  
  // 2. Parse Use Role
  const initialUseRole = params.useRole === "true" || params.useRole === true;

  // 3. Parse Can View By untuk menentukan Sysadmin Only
  // Params array bisa berupa string "sysadmin,owner" atau JSON string
  let initialCanViewBy: string[] = [];
  if (typeof params.can_view_by === 'string') {
      initialCanViewBy = params.can_view_by.split(',');
  } else if (Array.isArray(params.can_view_by)) {
      initialCanViewBy = params.can_view_by;
  }
  // Logic: Jika TIDAK ada 'owner', berarti Sysadmin Only = TRUE
  const initialSysadminOnly = !initialCanViewBy.includes('owner');

  // --- State ---
  const [form, setForm] = useState({
    name: params.name || "",
    icon: params.icon || "file-document-outline",
    path: params.path || "",
    component: params.component || "",
  });

  const [active, setActive] = useState(initialActive);
  const [useRole, setUseRole] = useState(initialUseRole);
  const [isSysadminOnly, setIsSysadminOnly] = useState(initialSysadminOnly);

  const [errors, setErrors] = useState<{ name?: string; path?: string }>({});

  const close = () => router.back();

  const handleSave = () => {
    let isValid = true;
    const newErrors: { name?: string; path?: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Nama halaman wajib diisi";
      isValid = false;
    }
    if (!form.path.trim()) {
      newErrors.path = "Path wajib diisi";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // Logic Can View By
    const updatedCanViewBy = isSysadminOnly ? ["sysadmin"] : ["sysadmin", "owner"];

    // ✅ KIRIM SIGNAL KE STORE
    setUpdateSignal({
      updatedType: "page",
      updatedId: params.id,
      updatedName: form.name,
      updatedIcon: form.icon,
      updatedPath: form.path,
      updatedComponent: form.component,
      
      // ✅ Update Field Baru
      updatedActive: active,
      updatedUseRole: useRole,
      updatedCanViewBy: updatedCanViewBy
    });

    close();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Card style={{ padding: 20, borderRadius: 16, backgroundColor: "#fff", maxHeight: '90%' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Edit Halaman</Text>
            </View>

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
            value={form.name}
            onChangeText={(v) => {
                setForm((p) => ({ ...p, name: v }));
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            error={errors.name}
            />

            {/* Icon Input */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <ValidatedInput
                        label="Icon (MaterialCommunityIcons)"
                        placeholder="Contoh: file-table"
                        value={form.icon}
                        onChangeText={(v) => setForm((p) => ({ ...p, icon: v }))}
                    />
                    <Pressable onPress={() => Linking.openURL('https://icons.expo.fyi/Index')}>
                        <Text style={{ fontSize: 12, color: '#2563eb', marginTop: -8, marginBottom: 12 }}>
                            Cari nama icon di sini
                        </Text>
                    </Pressable>
                </View>
                <View style={{ width: 50, height: 50, backgroundColor: "#f1f5f9", borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 12 }}>
                    <MaterialCommunityIcons name={form.icon as any} size={28} color="#334155" />
                </View>
            </View>

            <ValidatedInput
            label="Path"
            required
            value={form.path}
            onChangeText={(v) => {
                setForm((p) => ({ ...p, path: v }));
                if (errors.path) setErrors((p) => ({ ...p, path: undefined }));
            }}
            error={errors.path}
            />

            <ValidatedInput
            label="Component"
            value={form.component}
            onChangeText={(v) => setForm((p) => ({ ...p, component: v }))}
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
            <Pressable onPress={close} style={{ marginRight: 16, padding: 10 }}>
                <Text>Batal</Text>
            </Pressable>

            <Pressable
                onPress={handleSave}
                style={{ backgroundColor: "#2563eb", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 }}
            >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Simpan</Text>
            </Pressable>
            </View>
        </ScrollView>
      </Card>
    </View>
  );
}