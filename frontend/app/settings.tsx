import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "./contexts/SettingsContext";

export default function Settings() {
  const router = useRouter();
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
    vibrate("light");
    router.back();
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    vibrate("light");
    setTheme(newTheme);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Audio
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high" size={24} color={colors.primary} />
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
                trackColor={{ false: "#d1d5db", true: colors.primary }}
                thumbColor="#ffffff"
                ios_backgroundColor="#d1d5db"
              />
            </View>
          </View>
        </View>

        {/* Vibration Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Feedback tattile
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait" size={24} color={colors.primary} />
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
                trackColor={{ false: "#d1d5db", true: colors.primary }}
                thumbColor="#ffffff"
                ios_backgroundColor="#d1d5db"
              />
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Aspetto
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={styles.themeRow}
              onPress={() => handleThemeChange("light")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="sunny" size={24} color={colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Tema Chiaro
                  </Text>
                </View>
              </View>
              {theme === "light" && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            <TouchableOpacity
              style={styles.themeRow}
              onPress={() => handleThemeChange("dark")}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={24} color={colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Tema Scuro
                  </Text>
                </View>
              </View>
              {theme === "dark" && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
            Cosa Sceglieresti? © 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  backIcon: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
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
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
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
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  footer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
  },
});
