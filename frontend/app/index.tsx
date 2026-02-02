import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "./contexts/SettingsContext";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const router = useRouter();
  const { colors, vibrate } = useSettings();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    vibrate("light");
    setMenuVisible(!menuVisible);
  };

  const handleSettings = () => {
    toggleMenu();
    router.push("/settings");
  };

  const handleLogin = () => {
    toggleMenu();
    router.push("/contexts/login"); // o funzione di login Google
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <RNStatusBar
        barStyle={colors.background === "#000000" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={styles.header}>
        {/* Hamburger */}
        <TouchableOpacity onPress={toggleMenu} style={styles.headerLeft}>
          <Ionicons name="menu-outline" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Cosa Sceglieresti?</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Menu Hamburger */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <Pressable style={styles.overlay} onPress={toggleMenu}>
          <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogin}>
              <Ionicons name="log-in-outline" size={22} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Login Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
              <Ionicons name="settings-outline" size={22} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Impostazioni</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Scegli la modalità di gioco
        </Text>
      </View>

      {/* MODALITÀ */}
      <View style={{ paddingHorizontal: 20, gap: 20 }}>
        {/* Modalità Classica */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/categories")}
        >
          <LinearGradient
            colors={["#2563eb", "#3b82f6"]}
            style={styles.modeButton}
          >
            <View style={styles.modeContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modeTitle}>Modalità Classica</Text>
                <Text style={styles.modeSubtitle}>
                  Scegli la tua opzione preferita tra le categorie disponibili
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Indovina l'opzione più votata */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/popular")}
        >
          <LinearGradient
            colors={["#16a34a", "#22c55e"]}
            style={styles.modeButton}
          >
            <View style={styles.modeContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modeTitle}>Indovina l'opzione più votata</Text>
                <Text style={styles.modeSubtitle}>
                  Prova a indovinare cosa hanno scelto più utenti
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Sfida un amico */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/friend")}
        >
          <LinearGradient
            colors={["#f59e0b", "#fbbf24"]}
            style={styles.modeButton}
          >
            <View style={styles.modeContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modeTitle}>Sfida un amico</Text>
                <Text style={styles.modeSubtitle}>
                  Sfida un amico e indovina le sue preferenze
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Chi sei? */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/profile")}
        >
          <LinearGradient
            colors={["#8b5cf6", "#a78bfa"]}
            style={styles.modeButton}
          >
            <View style={styles.modeContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modeTitle}>Chi sei?</Text>
                <Text style={styles.modeSubtitle}>
                  Scopri il tuo profilo di personalità
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: { width: 40 },
  headerRight: { width: 40 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  subtitle: { fontSize: 16, textAlign: "center" },
  modeButton: {
    padding: 28,
    borderRadius: 22,
  },
  modeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  modeSubtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  menuContainer: {
    width: 220,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 20,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
