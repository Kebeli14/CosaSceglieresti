import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    soundEnabled,
    vibrationEnabled,
    theme,
    toggleSound,
    toggleVibration,
    setTheme,
    colors,
    vibrate,
  } = useSettings();

  const handleBack = () => {
    if (vibrate) vibrate("light");
    router.navigate("/profile"); 
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (vibrate) vibrate("light");
    setTheme(newTheme);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.headerSide}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        ><Ionicons name="arrow-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.standardTitle, { color: colors.text }]}>Impostazioni</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Audio e Feedback</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingTitle, { color: colors.text, marginLeft: 15 }]}>Effetti sonori</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: "#d1d5db", true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.background }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingTitle, { color: colors.text, marginLeft: 15 }]}>Vibrazione</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: "#d1d5db", true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Aspetto</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity style={styles.themeRow} onPress={() => handleThemeChange("light")} activeOpacity={0.7}>
              <View style={styles.settingInfo}>
                <Ionicons name="sunny-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingTitle, { color: colors.text, marginLeft: 15 }]}>Tema Chiaro</Text>
              </View>
              {theme === "light" && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.background }]} />
            <TouchableOpacity style={styles.themeRow} onPress={() => handleThemeChange("dark")} activeOpacity={0.7}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingTitle, { color: colors.text, marginLeft: 15 }]}>Tema Scuro</Text>
              </View>
              {theme === "dark" && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Lingua</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={() => Alert.alert("Lingua", "Altre lingue saranno disponibili a breve!")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingTitle, { color: colors.text, marginLeft: 15 }]}>Lingua App</Text>
              </View>
              <View style={styles.langRightContainer}>
                <Text style={[styles.langLabel, { color: colors.textSecondary }]}>Italiano</Text>
                <Text style={styles.flagEmojiSmall}>🇮🇹</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Informazioni</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, paddingVertical: 12 }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Versione</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Cosa Sceglieresti? © 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    height: 60, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20 
  },
  headerSide: { 
    width: 40, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  standardTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    flex: 1, 
    textAlign: "center" 
  },
  scrollView: { flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  card: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 56 },
  settingInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: "600" },
  themeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 56 },
  divider: { height: 1 },
  langRightContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langLabel: { fontSize: 14, fontWeight: '500' },
  flagEmojiSmall: { fontSize: 18 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", height: 40, alignItems: "center" },
  infoValue: { fontSize: 14 },
  footer: { paddingVertical: 30, alignItems: "center" },
  footerText: { fontSize: 12, fontWeight: "500", opacity: 0.5 },
});