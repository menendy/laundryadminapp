import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { Button, Checkbox } from "react-native-paper";

import { useLocalSearchParams, useRouter } from "expo-router";

import AppHeaderActions from "../../../components/ui/AppHeaderActions";
import ValidatedInput from "../../../components/ui/ValidatedInput";

import { getSysadminById, updateSysadmin  } from "../../../services/api/sysadminService";

import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { handleBackendError } from "../../../utils/handleBackendError";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";

export default function EditSysadminScreen() {
    const router = useRouter();
    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

    const { id } = useLocalSearchParams();
    const [nama, setNama] = useState("");
    const [active, setActive] = useState(true);

    const [telp, setTelp] = useState("");


    const [email, setEmail] = useState("");
    const [alias, setAlias] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");


    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: any = {};

        if (!nama.trim()) e.nama = "Nama tidak boleh kosong";
        if (!telp.trim()) e.telp = "Nomor Telepon tidak boleh kosong";

        setErrors(e);
        return Object.keys(e).length === 0;
    };




    useEffect(() => {
        loadDetail();
    }, [id]);

    const loadDetail = async () => {
        setLoading(true);

        try {
            const res = await getSysadminById(String(id));
            const ok = handleBackendError(res, () => { }, showSnackbar);
            if (!ok) return;
            const d = res.data;

            setNama(d.name ?? "");
            setPassword("");
            setConfirm("");
            setTelp(d.phone ?? "");
            setEmail(d.email ?? "");
            setAlias(d.alias ?? "");
            setActive(d.active ?? "");

        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {

        if (!validate()) {
            showSnackbar("Lengkapi data dengan benar", "error");
            return;
        }

        try {

            setLoading(true);
            const payload = {
                id: id,
                name: nama.trim(),
                alias: alias.trim(),
                phone: telp.trim(),
                email: email.trim(),
                password: password,
                confirm: confirm,
                active: active,
            }

            const res = await updateSysadmin(payload);
            const ok = handleBackendError(res, setErrors, showSnackbar);
            if (!ok) return;

            showSnackbar("Halaman berhasil diperbarui", "success");
            router.back();

        } catch (err) {
            handleBackendError(err, setErrors, showSnackbar);
        } finally {
            setLoading(false);
        }

    }





    return (
        <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
            <AppHeaderActions title="Tambah Sysadmin" showBack />

            <ScrollView
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 120, // 👈 Tambah jarak aman untuk tombol + navbar
                }}
                keyboardShouldPersistTaps="handled" // 👈 optional biar input tetap fokus
            >
                {/* STATUS */}
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: "700", marginBottom: 10 }}>
                        Aktif
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <ToggleSwitch value={active} onChange={setActive} />
                        <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "600" }}>
                            {active ? "Aktif" : "Nonaktif"}
                        </Text>
                    </View>
                </View>

                <ValidatedInput
                    label="Nama Lengkap"
                    required
                    placeholder="Contoh: Ridwan Tamar"
                    value={nama}
                    onChangeText={setNama}
                    error={errors.nama}
                />

                <ValidatedInput
                    label="Password"
                    required
                    value={password}
                    onChangeText={setPassword}
                    error={errors.password}
                    secureTextEntry
                />

                <ValidatedInput
                    label="Konfirmasi Password"
                    required
                    value={confirm}
                    onChangeText={setConfirm}
                    error={errors.confirm}
                    secureTextEntry
                />

                <ValidatedInput
                    label="Nama Panggilan"

                    placeholder="Contoh: Ridwan"
                    value={alias}
                    onChangeText={setAlias}
                    error={errors.nama}
                />

                <ValidatedInput
                    label="Nomor Telepon"
                    required
                    keyboardType="phone-pad"
                    placeholder="contoh: 08123456789"
                    value={telp}
                    onChangeText={setTelp}
                    error={errors.telp}
                />

                <ValidatedInput
                    label="Email"
                    required
                    keyboardType="email-address"
                    placeholder="contoh: laundry@gmail.com"
                    value={email}
                    onChangeText={setEmail}
                    error={errors.telp}
                />

                <Button
                    mode="contained"
                    onPress={handleUpdate}
                    loading={loading}
                    disabled={loading}
                    style={{ marginTop: 25 }}
                >
                    {loading ? "Menyimpan..." : "Tambah Sysadmin"}
                </Button>
            </ScrollView>
        </View>
    );
}
