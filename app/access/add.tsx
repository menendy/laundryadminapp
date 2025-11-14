import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import ValidatedInput from "../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../store/useSnackbarStore";

import { getUsersLite } from "../../services/api/usersService";
import { getOwnerListLite } from "../../services/api/ownersService";
import { getGroupListLite } from "../../services/api/groupsService";
import { getOutletListLite } from "../../services/api/outletsService";
import { getRoleListLite } from "../../services/api/rolesService";

import { addAccess } from "../../services/api/accessService";

import DropDownPicker from "react-native-dropdown-picker";

export default function AddAccessScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // ------------ FORM STATE ------------
  const [userId, setUserId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [outletId, setOutletId] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // ------------ DROPDOWN DATA ------------
  const [users, setUsers] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  // ------------ FETCH STATIC DROPDOWN ------------
  useEffect(() => {
    getUsersLite().then((r) => r.success && setUsers(r.data));
    getOwnerListLite().then((r) => r.success && setOwners(r.data));
    getRoleListLite().then((r) => r.success && setRolesList(r.data));
  }, []);

  // ------------ FETCH GROUPS WHEN OWNER CHANGES ------------
  useEffect(() => {
    if (ownerId)
      getGroupListLite(ownerId).then((r) => r.success && setGroups(r.data));
    else {
      setGroups([]);
      setGroupId("");
    }
  }, [ownerId]);

  // ------------ FETCH OUTLETS ------------
  useEffect(() => {
    if (ownerId)
      getOutletListLite(ownerId, groupId).then((r) => r.success && setOutlets(r.data));
    else {
      setOutlets([]);
      setOutletId("");
    }
  }, [ownerId, groupId]);

  // ------------ VALIDATION ------------
  const validate = () => {
    const e: any = {};
    if (!userId) e.userId = "Wajib dipilih";
    if (!ownerId) e.ownerId = "Wajib dipilih";
    if (!outletId) e.outletId = "Wajib dipilih";
    if (roles.length === 0) e.roles = "Minimal 1 role";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showSnackbar("Lengkapi semua data terlebih dahulu", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        user_id: userId,
        owner_id: ownerId,
        group_id: groupId || null,
        outlet_id: outletId,
        roles,
      };

      const result = await addAccess(payload);

      if (!result.success) {
        showSnackbar(result.message || "Gagal menambah akses", "error");
        return;
      }

      showSnackbar("Akses berhasil ditambahkan", "success");
      router.back();
    } catch (e) {
      console.error("🔥 addAccess:", e);
      showSnackbar("Error koneksi server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Akses User" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* USER */}
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>User</Text>
        <DropDownPicker
          open={false}
          value={userId}
          items={users.map((u) => ({ label: u.name, value: u.id }))}
          placeholder="Pilih user"
          setValue={(v) => setUserId(v())}
        />
        {errors.userId && <Text style={{ color: "red" }}>{errors.userId}</Text>}

        {/* OWNER */}
        <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 6 }}>Owner</Text>
        <DropDownPicker
          open={false}
          value={ownerId}
          items={owners.map((o) => ({ label: o.name, value: o.id }))}
          placeholder="Pilih owner"
          setValue={(v) => setOwnerId(v())}
        />
        {errors.ownerId && <Text style={{ color: "red" }}>{errors.ownerId}</Text>}

        {/* GROUP */}
        {groups.length > 0 && (
          <>
            <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 6 }}>Group (opsional)</Text>
            <DropDownPicker
              open={false}
              value={groupId}
              items={groups.map((g) => ({ label: g.name, value: g.id }))}
              placeholder="Pilih group"
              setValue={(v) => setGroupId(v())}
            />
          </>
        )}

        {/* OUTLET */}
        <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 6 }}>Outlet</Text>
        <DropDownPicker
          open={false}
          value={outletId}
          items={outlets.map((o) => ({ label: o.name, value: o.id }))}
          placeholder="Pilih outlet"
          setValue={(v) => setOutletId(v())}
        />
        {errors.outletId && <Text style={{ color: "red" }}>{errors.outletId}</Text>}

        {/* ROLES */}
        <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 6 }}>Roles</Text>
        <DropDownPicker
          multiple
          open={false}
          value={roles}
          items={rolesList.map((r) => ({ label: r.name, value: r.id }))}
          placeholder="Pilih roles"
          setValue={(v) => setRoles(v())}
        />
        {errors.roles && <Text style={{ color: "red" }}>{errors.roles}</Text>}

        <Button
          mode="contained"
          style={{ marginTop: 30 }}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          Simpan Akses
        </Button>
      </ScrollView>
    </View>
  );
}
