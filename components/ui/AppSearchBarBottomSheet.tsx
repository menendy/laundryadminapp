import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import {
  Portal,
  Surface,
  Text,
  TouchableRipple,
  TextInput,
  IconButton,
} from "react-native-paper";

import { useSafeAreaInsets } from "react-native-safe-area-context";


const { height } = Dimensions.get("window");


interface Category {
  label: string;
  value: string;
}

interface AppSearchBarBottomSheetProps {
  value: string;
  onChangeText: (text: string) => void;
  mode?: string;
  onChangeMode: (newMode: string) => void;
  placeholder?: string;
  categories?: Category[];
  defaultMode?: string;
}

export default function AppSearchBarBottomSheet({
  value,
  onChangeText,
  mode,
  onChangeMode,
  placeholder = "Cari sesuatu...",
  categories = [
    { label: "Semua", value: "semua" },
    { label: "Nama", value: "nama" },
    { label: "Nomor Telpon", value: "telp" },
  ],
  defaultMode = "semua",
}: AppSearchBarBottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    // ✅ Tutup keyboard sebelum membuka bottom sheet
    Keyboard.dismiss();

    // Sedikit delay biar animasi smooth (opsional tapi direkomendasikan)
    setTimeout(() => {
        setVisible(true);
        Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        }).start();
    }, 100);
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleSelect = (newMode: string) => {
    onChangeMode(newMode);
    closeSheet();
  };

  // Ambil label dari mode aktif
  const currentLabel =
    categories.find((c) => c.value === mode)?.label ||
    categories.find((c) => c.value === defaultMode)?.label ||
    "Semua";
  
    const insets = useSafeAreaInsets();

  return (
    <>
      <View style={styles.container}>
        <View style={styles.comboContainer}>
          <TouchableRipple onPress={openSheet} style={styles.comboLeft}>
            <View style={styles.leftBox}>
              <Text style={styles.comboText}>{currentLabel}</Text>
              <IconButton icon="chevron-down" size={18} style={styles.comboIcon} />
            </View>
          </TouchableRipple>

          <TextInput
            mode="flat"
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            style={styles.comboRight}
            dense
            underlineColor="transparent"
            selectionColor="#1976d2"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* ⬆️ Bottom Sheet */}
      <Portal>
        {visible && (
          <>
            <TouchableWithoutFeedback onPress={closeSheet}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[styles.sheetContainer, { transform: [{ translateY }] }]}
            >
              <Surface style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Pilih kategori pencarian</Text>
                  <IconButton icon="close" onPress={closeSheet} />
                </View>

                {categories.map((item) => (
                  <TouchableRipple
                    key={item.value}
                    onPress={() => handleSelect(item.value)}
                  >
                    <View
                      style={[
                        styles.option,
                        mode === item.value && styles.optionSelected,
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: mode === item.value ? "#1976d2" : "#333",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
              </Surface>
            </Animated.View>
          </>
        )}
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  comboContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  comboLeft: {
    width: 120,
    backgroundColor: "#f9f9f9",
    borderRightWidth: 1,
    borderRightColor: "#bbb",
    justifyContent: "center",
  },
  leftBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
  },
  comboText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "700",
  },
  comboIcon: {
    margin: 0,
  },
  comboRight: {
    flex: 1,
    height: 42,
    backgroundColor: "#fff",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionSelected: {
    backgroundColor: "#e3f2fd",
  },
});
