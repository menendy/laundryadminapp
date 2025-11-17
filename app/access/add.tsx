import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

import AppHeaderActions from "../../components/ui/AppHeaderActions";
import { useSnackbarStore } from "../../store/useSnackbarStore";

import { getUsersLite } from "../../services/api/usersService";
import { getOwnerListLite } from "../../services/api/ownersService";
import { getGroupListLite } from "../../services/api/groupsService";
import { getOutletListLite } from "../../services/api/outletsService";
import { getRoleListLite } from "../../services/api/rolesService";

import { addAccess } from "../../services/api/accessService";

import AppAutocomplete from "../../components/ui/AppAutocomplete";
import AppMultiSelect from "../../components/ui/AppMultiSelect";

export default function AddAccessScreen() {
  const router = useRouter();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // --- VALUE STATES ---
  const [userId, setUserId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [groupId, setGroupId] = useState("");
  //const [outletId, setOutletId] = useState("");
  const [outletIds, setOutletId] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  // --- DATA LIST ---
  const [users, setUsers] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  // --- FETCH STATIC LIST ---
  useEffect(() => {
    getUsersLite().then((r) => r.success && setUsers(r.data));
    getOwnerListLite().then((r) => r.success && setOwners(r.data));
    //getRoleListLite().then((r) => r.success && setRolesList(r.data));
  }, []);

  // --- FETCH OUTLETS ---
  useEffect(() => {
    if (ownerId) {
      getOutletListLite(ownerId).then((r) => {
        if (r.success) {
          console.log("📌 OUTLET API DATA:", r.data);
          setOutlets(r.data);
        }
      });
    } else {
      setOutlets([]);
      setOutletId("");
    }
  }, [ownerId]);

  // --- FETCH ROLES BY OWNER ---
  useEffect(() => {
    if (ownerId) {
      getRoleListLite(ownerId).then((r) => r.success && setRolesList(r.data));
    } else {
      setRoles([]);
      //setGroupId("");
    }
  }, [ownerId]);

  // --- VALIDATION ---
  const validate = () => {
    const e: any = {};
    if (!userId) e.userId = "Wajib dipilih";
    if (!ownerId) e.ownerId = "Wajib dipilih";
    //if (!outletId) e.outletId = "Wajib dipilih";
    if (outletIds.length === 0) e.outletIds = "Minimal pilih 1 outlet";
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
        //outlet_id: outletId,
        outlet_id: outletIds,
        roles,
      };

      console.log("📌 PAYLOAD:", payload);

      const result = await addAccess(payload);
      if (!result.success) {
        showSnackbar(result.message || "Gagal menambah akses", "error");
        return;
      }

      showSnackbar("Akses berhasil ditambahkan", "success");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppHeaderActions title="Tambah Akses User" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* USER */}
        <AppAutocomplete
          label="User"
          placeholder="Pilih user"
          value={userId}
          onChange={(val) => {
            //console.log("📌 USER SELECTED:", val);
            setUserId(val);
          }}
          items={users.map((u) => ({ label: u.name, value: u.id }))}
        />
        {errors.userId && <Text style={{ color: "red" }}>{errors.userId}</Text>}

        {/* OWNER */}
        <AppAutocomplete
          label="Owner"
          placeholder="Pilih owner"
          value={ownerId}
          onChange={(val) => {
            //console.log("📌 OWNER SELECTED:", val);
            setOwnerId(val);
          }}
          items={owners.map((o) => ({ label: o.name, value: o.id }))}
        />
        {errors.ownerId && <Text style={{ color: "red" }}>{errors.ownerId}</Text>}

        {/* GROUP */}
        {groups.length > 0 && (
          <AppAutocomplete
            label="Group (opsional)"
            placeholder="Pilih group"
            value={groupId}
            onChange={(val) => {
              //console.log("📌 GROUP SELECTED:", val);
              setGroupId(val);
            }}
            items={groups.map((g) => ({ label: g.name, value: g.id }))}
          />
        )}

        {/* OUTLET */}
       <AppMultiSelect
   label="Outlet"
   placeholder="Pilih outlet"
   value={outletIds}
   onChange={(val) => {
     console.log("📌 OUTLET SELECTED:", val);
     setOutletId(val);
   }}
   items={outlets.map((o) => ({ label: o.name, value: o.id }))}
 />
 {errors.outletIds && (
   <Text style={{ color: "red" }}>{errors.outletIds}</Text>
 )}

        {/* ROLES */}
        <AppMultiSelect
          label="Roles"
          placeholder="Pilih roles"
          value={roles}
          onChange={(val) => {
            console.log("📌 ROLES SELECTED:", val);
            setRoles(val);
          }}
          items={rolesList.map((r) => ({ label: r.name, value: r.id }))}
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
