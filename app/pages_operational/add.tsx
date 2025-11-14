import React, { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Button, Chip } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { addPageOperational } from "../../services/api/pagesOperationalService";
import { useSnackbarStore } from "../../store/useSnackbarStore";
import { handleBackendError } from "../../utils/handleBackendError";

export default function AddPageOperationalScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const [ownerId, setOwnerId] = useState("");
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [component, setComponent] = useState("");
  const [sort, setSort] = useState("0");
  const [active, setActive] = useState(true);

  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any>({});

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const toggleRole = (role: string) => {
    setAllowedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((x) => x !== role)
        : [...prev, role]
    );
  };

  const togglePermission = (role: string, perm: string) => {
    setPermissions((prev: any) => {
      const current = prev[role] || [];
      return {
        ...prev,
        [role]: current.includes(perm)
          ? current.filter((x: string) => x !== perm)
          : [...current, perm],
      };
    });
  };

  const validate = () => {
    const e: any = {};

    if (!ownerId.trim()) e.ownerId = "Owner wajib diisi";
    if (!name.trim()) e.name = "Nama wajib diisi";
    if (!path.trim()) e.path = "Path wajib diisi";
    if (!component.trim()) e.component = "Component wajib diisi";

    if (allowedRoles.length === 0)
      e.roles = "Pilih minimal 1 role";

    if (Object.keys(permissions).length === 0)
      e.perm = "Minimal 1 permission harus ada";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi data dengan benar", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        owner_id: ownerId.trim(),
        name: name.trim(),
        path: path.trim(),
        component: component.trim(),
        sort: Number(sort),
        active,
        allowed_roles: allowedRoles,
        permissions,
      };

      const result = await addPageOperational(payload);

      const ok = handleBackendError(result, setErrors, showSnackbar);
      if (!ok) return;

      showSnackbar("Halaman operasional ditambahkan!", "success");
      router.back();
    } catch (err) {
      console.error("🔥 Error addPageOperational:", err);
      showSnackbar("Terjadi kesalahan server", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Halaman Operasional" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ValidatedInput
          label="Owner ID"
          required
          value={ownerId}
          onChangeText={setOwnerId}
          error={errors.ownerId}
        />

        <ValidatedInput
          label="Nama Halaman"
          required
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ValidatedInput
          label="Route Name"
          required
          value={path}
          onChangeText={setPath}
          placeholder="PickupScreen"
          error={errors.path}
        />

        <ValidatedInput
          label="Component"
          required
          value={component}
          onChangeText={setComponent}
          placeholder="PickupScreen"
          error={errors.component}
        />

        <ValidatedInput
          label="Sort Order"
          keyboardType="numeric"
          value={sort}
          onChangeText={setSort}
        />

        <Text style={{ marginTop: 20, fontWeight: "700" }}>
          Status Halaman
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Chip selected={active} onPress={() => setActive(true)}>
            Aktif
          </Chip>
          <Chip selected={!active} onPress={() => setActive(false)}>
            Nonaktif
          </Chip>
        </View>

        <Text style={{ marginTop: 20, fontWeight: "700" }}>
          Allowed Roles Operasional
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {["kurir", "cuci", "setrika", "finishing", "leader"].map(
            (role) => (
              <Chip
                key={role}
                selected={allowedRoles.includes(role)}
                onPress={() => toggleRole(role)}
              >
                {role}
              </Chip>
            )
          )}
        </View>

        <Text style={{ marginTop: 20, fontWeight: "700" }}>
          Permissions
        </Text>

        {allowedRoles.map((role) => (
          <View key={role} style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "600" }}>{role}</Text>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              {["view", "update"].map((perm) => (
                <Chip
                  key={perm}
                  selected={permissions[role]?.includes(perm)}
                  onPress={() => togglePermission(role, perm)}
                >
                  {perm}
                </Chip>
              ))}
            </View>
          </View>
        ))}

        <Button
          mode="contained"
          style={{ marginTop: 20 }}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Tambah Halaman"}
        </Button>
      </ScrollView>
    </View>
  );
}
