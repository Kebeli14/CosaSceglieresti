import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "./contexts/SettingsContext";
// 1. Importiamo gli Insets
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 2. Calcoliamo lo spazio sicuro
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
    router.back();
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (vibrate) vibrate("light");
    setTheme(newTheme);
  };

  return (
    <View
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          // 3. Applichiamo il padding dinamico per la fotocamera/notch
          paddingTop: insets.top 
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Impostazioni
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Settings Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Audio
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high" size={24} color="#3b82f6" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Effetti sonori
                  </Text>
                  <Text
                    style={[styles.settingDescription, { color: colors.textSecondary }]}
                  >
                    Attiva i suoni dell'app
                  </Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                thumbColor="#ffffff"
                ios_backgroundColor="#d1d5db"
              />
            </View>
          </View>
        </View>

        {/* Vibration Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Feedback tattile
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait" size={24} color="#3b82f6" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Vibrazione
                  </Text>
                  <Text
                    style={[styles.settingDescription, { color: colors.textSecondary }]}
                  >
                    Abilita feedback tattile
                  </Text>
                </View>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                thumbColor="#ffffff"
                ios_backgroundColor="#d1d5db"
              />
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Aspetto
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={styles.themeRow}
              onPress={() => handleThemeChange("light")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="sunny" size={24} color="#3b82f6" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Tema Chiaro
                  </Text>
                </View>
              </View>
              {theme === "light" && (
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            <TouchableOpacity
              style={styles.themeRow}
              onPress={() => handleThemeChange("dark")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={24} color="#3b82f6" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Tema Scuro
                  </Text>
                </View>
              </View>
              {theme === "dark" && (
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Informazioni
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Versione
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                1.0.0
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.background }]} />
            
            <View style={styles.infoRow}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Sviluppato con
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                ❤️
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Cosa Sceglieresti? © 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backIcon: {
    width: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  footer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
});