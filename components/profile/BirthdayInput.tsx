import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable, // 🔥 Ganti ke Pressable untuk Android agar lebih stabil
  Platform,
  ScrollView,
  Text as RNText,
  InteractionManager, // 🔥 IMPORT PENTING
} from "react-native";
import { IconButton, Button } from "react-native-paper";
import Modal from "react-native-modal";
// 🔥 Import DateTimePickerAndroid
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

interface BirthdayInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function BirthdayInput({ value, onChange }: BirthdayInputProps) {
  // 1. Tentukan Date Object (Visual)
  const pickerDate = value ? new Date(value) : new Date();

  // State Mobile Modal (HANYA IOS)
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [tempDateIOS, setTempDateIOS] = useState(pickerDate);

  // State Web Dropdown
  const [activeWebDropdown, setActiveWebDropdown] = useState<string | null>(null);

  // === HELPER ===
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "DD Bulan YYYY";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "DD Bulan YYYY";

    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // ==========================================
  // 🔥 FINAL FIX: ANDROID INTERACTION MANAGER
  // ==========================================
  const openAndroidPicker = useCallback(() => {
    // 1. Paksa tutup dialog sebelumnya (jika ada yang nyangkut/double trigger)
    DateTimePickerAndroid.dismiss('date');

    // 2. Tunggu sampai animasi klik/touch SELESAI total, baru buka dialog
    InteractionManager.runAfterInteractions(() => {
        DateTimePickerAndroid.open({
            value: pickerDate,
            onChange: (event, selectedDate) => {
                // Android handling standard
                if (event.type === 'set' && selectedDate) {
                    onChange(selectedDate.toISOString().split("T")[0]);
                }
            },
            mode: 'date',
            display: 'spinner',
            maximumDate: new Date(),
        });
    });
  }, [pickerDate, onChange]);

  // === IOS HANDLERS ===
  const openIOSPicker = () => {
    setTempDateIOS(pickerDate);
    setShowIOSPicker(true);
  };

  const onIOSChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) setTempDateIOS(selectedDate);
  };

  const confirmIOS = () => {
    onChange(tempDateIOS.toISOString().split("T")[0]);
    setShowIOSPicker(false);
  };

  // === MAIN TRIGGER ===
  const handleOpenPicker = () => {
      // Tutup web dropdown jika ada
      if (Platform.OS === 'web') setActiveWebDropdown(null);

      if (Platform.OS === 'android') {
          openAndroidPicker();
      } else {
          openIOSPicker();
      }
  }

  // === WEB HANDLERS ===
  const handleWebSelect = (type: "day" | "month" | "year", val: number) => {
    const baseDate = value ? new Date(value) : new Date();
    if (type === "day") baseDate.setDate(val);
    if (type === "month") baseDate.setMonth(val);
    if (type === "year") baseDate.setFullYear(val);
    onChange(baseDate.toISOString().split("T")[0]);
    setActiveWebDropdown(null);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const WebOptionItem = ({ label, onPress, isSelected }: any) => (
    <TouchableOpacity style={[styles.webOptionItem, isSelected && styles.webOptionSelected]} onPress={onPress}>
      <RNText style={[styles.webOptionText, isSelected && styles.webOptionTextSelected]}>{label}</RNText>
    </TouchableOpacity>
  );

  // 🔥 PILIH KOMPONEN TOMBOL BERDASARKAN OS
  // Android pakai Pressable (tanpa animasi opacity bawaan) untuk mengurangi glitch UI
  const TriggerComponent = Platform.OS === 'android' ? Pressable : TouchableOpacity;

  return (
    <View style={{ zIndex: 100 }}>
      {/* === WEB VERSION === */}
      {Platform.OS === "web" ? (
        <View style={styles.webContainer}>
          <View style={styles.webSelectWrapper}>
            {activeWebDropdown === "day" && (
              <View style={styles.dropUpListContainer}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {days.map((d) => (<WebOptionItem key={d} label={d} isSelected={value ? new Date(value).getDate() === d : false} onPress={() => handleWebSelect("day", d)} />))}
                </ScrollView>
              </View>
            )}
            <TouchableOpacity style={styles.webSelectButton} onPress={() => setActiveWebDropdown(activeWebDropdown === "day" ? null : "day")}>
              <RNText style={[styles.webSelectText, !value && { color: "#999" }]}>{value ? new Date(value).getDate() : "Tgl"}</RNText>
              <IconButton icon={activeWebDropdown === "day" ? "chevron-up" : "chevron-down"} size={16} iconColor="#666" />
            </TouchableOpacity>
          </View>

          <View style={[styles.webSelectWrapper, { flex: 2 }]}>
            {activeWebDropdown === "month" && (
              <View style={styles.dropUpListContainer}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {months.map((m, i) => (<WebOptionItem key={i} label={m} isSelected={value ? new Date(value).getMonth() === i : false} onPress={() => handleWebSelect("month", i)} />))}
                </ScrollView>
              </View>
            )}
            <TouchableOpacity style={styles.webSelectButton} onPress={() => setActiveWebDropdown(activeWebDropdown === "month" ? null : "month")}>
              <RNText style={[styles.webSelectText, !value && { color: "#999" }]}>{value ? months[new Date(value).getMonth()] : "Bulan"}</RNText>
              <IconButton icon={activeWebDropdown === "month" ? "chevron-up" : "chevron-down"} size={16} iconColor="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.webSelectWrapper}>
            {activeWebDropdown === "year" && (
              <View style={styles.dropUpListContainer}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {years.map((y) => (<WebOptionItem key={y} label={y} isSelected={value ? new Date(value).getFullYear() === y : false} onPress={() => handleWebSelect("year", y)} />))}
                </ScrollView>
              </View>
            )}
            <TouchableOpacity style={styles.webSelectButton} onPress={() => setActiveWebDropdown(activeWebDropdown === "year" ? null : "year")}>
              <RNText style={[styles.webSelectText, !value && { color: "#999" }]}>{value ? new Date(value).getFullYear() : "Tahun"}</RNText>
              <IconButton icon={activeWebDropdown === "year" ? "chevron-up" : "chevron-down"} size={16} iconColor="#666" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* === MOBILE VERSION === */
        <View>
          {/* 🔥 GUNAKAN COMPONENT DINAMIS (Pressable untuk Android) */}
          <TriggerComponent
            style={({ pressed }: any) => [
                styles.inputTriggerContainer,
                // Manual opacity style untuk Pressable Android agar tetap ada feedback visual sedikit
                Platform.OS === 'android' && pressed && { backgroundColor: '#F0F0F0' }
            ]}
            onPress={handleOpenPicker}
            activeOpacity={0.7} // Hanya efek ke iOS TouchableOpacity
          >
            <RNText style={styles.inputLabel}>Pilih Tanggal</RNText>
            <View style={styles.inputValueRow}>
              <RNText style={[styles.inputValueText, !value && { color: "#999" }]}>
                {formatDateIndo(value)}
              </RNText>
              <IconButton icon="chevron-down" size={20} iconColor="#666" style={{ margin: 0 }} />
            </View>
          </TriggerComponent>

          {/* iOS MODAL (Hanya dirender di iOS) */}
          {Platform.OS === "ios" && (
            <Modal
              isVisible={showIOSPicker}
              onBackdropPress={() => setShowIOSPicker(false)}
              style={{ justifyContent: "flex-end", margin: 0 }}
            >
              <View style={styles.iosPickerContainer}>
                <View style={styles.iosHeader}>
                  <RNText style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>Pilih Tanggal Lahir</RNText>
                  <TouchableOpacity onPress={() => setShowIOSPicker(false)}>
                    <RNText style={{ color: "red", fontSize: 16 }}>Batal</RNText>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDateIOS} mode="date" display="spinner" onChange={onIOSChange} maximumDate={new Date()} textColor="black" locale="id-ID"
                />
                <Button mode="contained" onPress={confirmIOS} style={{ backgroundColor: "#00A651", marginTop: 10 }}>Pilih</Button>
              </View>
            </Modal>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputTriggerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FAFAFA", marginTop: 8, height: 60, justifyContent: "center" },
  inputLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  inputValueRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inputValueText: { fontSize: 16, color: "#333", fontWeight: "500" },
  iosPickerContainer: { backgroundColor: "white", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  iosHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 },
  webContainer: { flexDirection: "row", gap: 10, marginTop: 10, justifyContent: "space-between", zIndex: 100 },
  webSelectWrapper: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#fff", height: 45, justifyContent: "center", position: "relative", zIndex: 100 },
  webSelectButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, height: "100%" },
  webSelectText: { fontSize: 14, color: "#333" },
  dropUpListContainer: { position: "absolute", bottom: "100%", left: 0, right: 0, backgroundColor: "white", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 5, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 9999 },
  webOptionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  webOptionSelected: { backgroundColor: "#e3f2fd" },
  webOptionText: { color: "#333", fontSize: 14 },
  webOptionTextSelected: { color: "#1976D2", fontWeight: "bold" },
});