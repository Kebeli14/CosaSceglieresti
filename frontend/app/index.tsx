import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "./contexts/SettingsContext";
import { useAuth } from "./contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, vibrate } = useSettings();
  const { user } = useAuth();

  // Usiamo "any" per evitare l'errore su router.push
  const navigateTo = (path: any) => {
    if (vibrate) vibrate("light");
    router.push(path);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileSection} 
          onPress={() => navigateTo("/profile")}
        >
          <View style={[styles.avatarContainer, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
              {user ? "CIAO," : "BENVENUTO"}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user ? user.displayName : "Login"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.subtitleContainer}>
          <Text style={[styles.subtitle, { color: colors.text }]}>Scegli la sfida</Text>
        </View>

        <View style={styles.menuContainer}>
          
          {/* Modalità Classica */}
          <TouchableOpacity onPress={() => navigateTo("/categories")}>
            <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.modeButton}>
              <Text style={styles.modeTitle}>Modalità Classica</Text>
              <Text style={styles.modeSubtitle}>Le categorie di sempre</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Popolare */}
          <TouchableOpacity onPress={() => navigateTo("/popular")}>
            <LinearGradient colors={["#8b5cf6", "#7c3aed"]} style={styles.modeButton}>
              <Text style={styles.modeTitle}>Indovina la Popolare</Text>
              <Text style={styles.modeSubtitle}>Cosa pensa la massa?</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Sfida Amico */}
          <TouchableOpacity onPress={() => navigateTo("/online")}>
            <LinearGradient colors={["#f59e0b", "#d97706"]} style={styles.modeButton}>
              <Text style={styles.modeTitle}>Sfida un amico</Text>
              <Text style={styles.modeSubtitle}>Tu lo conosci davvero?</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    paddingHorizontal: 25, 
    paddingVertical: 15 
  },
  profileSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  welcomeText: { fontSize: 10, fontWeight: "700" },
  userName: { fontSize: 18, fontWeight: "800" },
  subtitleContainer: { paddingHorizontal: 25, marginVertical: 20 },
  subtitle: { fontSize: 24, fontWeight: "800" },
  menuContainer: { paddingHorizontal: 20, gap: 15 },
  modeButton: { 
    padding: 25, 
    borderRadius: 20,
    justifyContent: "center"
  },
  modeTitle: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "800" 
  },
  modeSubtitle: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 14, 
    marginTop: 5 
  }
});