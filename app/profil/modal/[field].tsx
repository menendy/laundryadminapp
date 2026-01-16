import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard, // ✅ Pastikan Keyboard diimport
  InteractionManager,
} from "react-native";
import Modal from "react-native-modal";
import { Button, IconButton, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

import ValidatedInput from "../../../components/ui/ValidatedInput";
import { useSnackbarStore } from "../../../store/useSnackbarStore";
import { updateProfile } from "../../../services/api/profilService";
import { handleBackendError } from "../../../utils/handleBackendError";

import GenderInput from "../../../components/profile/GenderInput";
import BirthdayInput from "../../../components/profile/BirthdayInput";

export default function EditFieldBottomSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const { id, field, label, value, rootPath, basePath } = params;

  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  // --- INITIAL VALUE LOGIC ---
  const getInitialValue = () => {
    if (!value) return "";
    if (field === 'phone') {
        let clean = value.replace(/[^0-9]/g, ""); 
        if (clean.startsWith("62")) clean = clean.substring(2); 
        if (clean.startsWith("0")) clean = clean.substring(1);  
        return clean;
    }
    return value;
  };

  const [inputValue, setInputValue] = useState(getInitialValue());
  const [errors, setErrors] = useState<any>({});
  const [saving, setSaving] = useState(false);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Ref untuk menampung data update sementara (Anti-Blink)
  const pendingUpdate = useRef<{ field: string; value: string } | null>(null);

  const setFieldErrors = (errorMap: any) => {
    setErrors((prev: any) => ({ ...prev, ...errorMap }));
  };

  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      setIsVisible(true);
      overlayOpacity.value = withTiming(1, { duration: 300 });
    });

    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      interactionPromise.cancel();
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const close = () => {
    overlayOpacity.value = withTiming(0, { duration: 250 });
    setIsVisible(false);
  };

  // Logic eksekusi update params saat modal hidden
  const onModalHide = () => {
    if (pendingUpdate.current) {
        router.setParams({
            updatedField: pendingUpdate.current.field,
            updatedValue: pendingUpdate.current.value,
        });
        
        showSnackbar("Perubahan disimpan", "success");
    }

    router.back();
  };

  const handleSave = async () => {
    // 🔥 1. TUTUP KEYBOARD DULUAN SEBELUM PROSES MULAI
    Keyboard.dismiss();

    if (!inputValue || !inputValue.trim()) {
      setErrors({ [field]: `${label} tidak boleh kosong` });
      return;
    }

    try {
      setSaving(true);
      
      let valueToSend = inputValue.trim();
      if (field === 'phone') {
          let clean = valueToSend.replace(/[^0-9]/g, ""); 
          if (clean.startsWith("0")) clean = clean.substring(1);
          valueToSend = "+62" + clean;
      }

      const payload = {
        [field]: valueToSend,
        rootPath,
        basePath,
      };

      const res = await updateProfile(String(id), payload);
      const ok = handleBackendError(res, setErrors, showSnackbar);
      if (!ok) return;

      // Simpan data ke Ref & Tutup Modal
      pendingUpdate.current = {
          field: field,
          value: valueToSend
      };

      close(); 
      
    } catch (err: any) {
      const ok = handleBackendError(err, setFieldErrors, showSnackbar);
      if (!ok) {
        const data = err?.response?.data;
        if (data?.field && data?.message) {
          setFieldErrors({ [data.field]: data.message });
        }
        return;
      }
    } finally {
      setSaving(false);
    }
  };

  // Logic Padding Bottom:
  // - Mobile: 0 jika keyboard muncul, insets.bottom jika tidak.
  // - Web: Selalu beri padding tambahan (misal 20) agar tombol naik.
  const containerPaddingBottom = Platform.OS === 'web' 
    ? 20 
    : (isKeyboardVisible ? 0 : insets.bottom);

  const isWebBirthday = Platform.OS === 'web' && field === 'birthday';
  const isAddress = field === 'address' || field === 'alamat';

  return (
    <Modal
      isVisible={isVisible}
      onModalHide={onModalHide}
      swipeDirection={Platform.OS === 'web' ? undefined : "down"}
      onBackdropPress={close}
      onSwipeComplete={close}
      
      hasBackdrop={false} 
      backdropOpacity={0}
      
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300} 
      
      backdropTransitionOutTiming={0} 
      hideModalContentWhileAnimating={false} 
      useNativeDriver={true} 
      useNativeDriverForBackdrop={true}
      
      coverScreen={true}
      statusBarTranslucent={true}
      style={{ justifyContent: "flex-end", margin: 0 }}
      propagateSwipe={true} 
      avoidKeyboard={false} 
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "transparent", opacity: overlayOpacity },
        ]}
      />

      <TouchableWithoutFeedback onPress={close}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        enabled={Platform.OS === "ios" || isKeyboardVisible} 
        style={{ width: "100%" }}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingHorizontal: 18,
            paddingTop: 10,
            paddingBottom: containerPaddingBottom, // Menggunakan logic baru
            ...(Platform.OS === 'web' ? { overflow: 'visible' } : {})
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700" }}>
              Ubah {label}
            </Text>
            <IconButton icon="close" onPress={close} />
          </View>

          {/* Input Area */}
          <View style={{ 
            maxHeight: isWebBirthday ? undefined : Dimensions.get('window').height * 0.6,
            ...(Platform.OS === 'web' ? { overflow: 'visible', zIndex: 10 } : {})
          }}> 
            
            {isWebBirthday ? (
               <View style={{ zIndex: 20 }}>
                 <BirthdayInput
                   value={inputValue}
                   onChange={(val) => {
                     setErrors({});
                     setInputValue(val);
                   }}
                 />
                 {errors[field] && (
                   <Text style={{ color: "red", marginTop: 5, fontSize: 12 }}>
                     {errors[field]}
                   </Text>
                 )}
               </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                {field === "gender" ? (
                  <View>
                    <GenderInput
                      value={inputValue}
                      onChange={(val) => {
                        setErrors({});
                        setInputValue(val);
                      }}
                    />
                    {errors[field] && (
                      <Text style={{ color: "red", marginTop: 5, fontSize: 12 }}>
                        {errors[field]}
                      </Text>
                    )}
                  </View>
                ) : field === "birthday" ? (
                  <View>
                    <BirthdayInput
                      value={inputValue}
                      onChange={(val) => {
                        setErrors({});
                        setInputValue(val);
                      }}
                    />
                    {errors[field] && (
                      <Text style={{ color: "red", marginTop: 5, fontSize: 12 }}>
                        {errors[field]}
                      </Text>
                    )}
                  </View>
                ) : field === "phone" ? (
                  <View>
                    <ValidatedInput
                      label={label}
                      value={inputValue}
                      onChangeText={(t) => {
                        let clean = t.replace(/[^0-9]/g, "");
                        if (clean.startsWith("0")) clean = clean.substring(1);
                        setErrors({});
                        setInputValue(clean);
                      }}
                      error={errors[field]}
                      placeholder="812xxxxxxx"
                      keyboardType="phone-pad"
                      autoFocus={false}
                      style={{ backgroundColor: 'transparent' }}
                      prefix={
                        <Text style={{ fontSize: 16, color: "#555" }}>+62</Text>
                      }
                    />
                  </View>
                ) : (
                  <View>
                    <ValidatedInput
                      label={label}
                      value={inputValue}
                      onChangeText={(t) => {
                        setErrors({});
                        setInputValue(t);
                      }}
                      error={errors[field]}
                      placeholder={`Masukkan ${label}`}
                      autoFocus={false}
                      multiline={isAddress}
                      numberOfLines={isAddress ? 4 : 1}
                      style={[
                         { backgroundColor: 'transparent' },
                         isAddress ? { height: 100, textAlignVertical: 'top' } : {}
                      ]}
                    />
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          {/* Tombol Simpan */}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={{
              marginTop: 20,
              marginBottom: 0, 
              backgroundColor: "#1976D2",
              zIndex: 1 
            }}
          >
            Simpan
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}