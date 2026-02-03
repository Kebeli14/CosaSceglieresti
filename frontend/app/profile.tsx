import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "./contexts/SettingsContext";
import { useAuth } from "./contexts/AuthContext";
// 1. Importa gli insets
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 2. Inizializza gli insets
  const { colors, vibrate } = useSettings();
  const { user, logout } = useAuth();

  const handleOptionPress = (path: string) => {
    if (vibrate) vibrate("light");
    router.push(path);
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          // 3. Applica il padding superiore dinamico
          paddingTop: insets.top 
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Il Tuo Profilo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { borderColor: "#3b82f6", backgroundColor: colors.cardBackground }]}>
            <Ionicons name="person" size={60} color={colors.textSecondary} />
          </View>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {user ? user.displayName : "Ospite"}
          </Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>
            {user ? user.email : "Esegui il login per salvare i dati"}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]} 
            onPress={() => handleOptionPress("/achievements")}
          >
            <Ionicons name="trophy-outline" size={24} color="#3b82f6" />
            <Text style={[styles.optionTitle, { color: colors.text, flex: 1, marginLeft: 15 }]}>Achievements</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]} 
            onPress={() => handleOptionPress("/settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#3b82f6" />
            <Text style={[styles.optionTitle, { color: colors.text, flex: 1, marginLeft: 15 }]}>Impostazioni</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionItem, { backgroundColor: "#FFF9E6", borderWidth: 1, borderColor: "#F59E0B" }]} 
            onPress={() => handleOptionPress("/premium")}
          >
            <Ionicons name="megaphone-outline" size={24} color="#F59E0B" />
            <Text style={[styles.optionTitle, { color: "#000", flex: 1, marginLeft: 15 }]}>Rimuovi Ads</Text>
            <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Disconnetti</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  profileSection: { alignItems: "center", marginVertical: 30 },
  avatarContainer: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 4 
  },
  displayName: { fontSize: 24, fontWeight: "800", marginTop: 10 },
  username: { fontSize: 15, marginTop: 4 },
  optionsContainer: { paddingHorizontal: 20, gap: 12 },
  optionItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 18, 
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  optionTitle: { fontSize: 16, fontWeight: "700" },
  logoutButton: { 
    marginTop: 30, 
    padding: 20, 
    alignItems: 'center', 
    marginBottom: 50 
  },
  logoutText: { color: "#EF4444", fontWeight: "700", fontSize: 16 }
});