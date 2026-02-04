import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, vibrate } = useSettings();
  const { user } = useAuth();
  const [popularRecord, setPopularRecord] = useState(0);

  // Carica il record all'avvio e ogni volta che la schermata torna in focus
  useEffect(() => {
    loadRecord();
  }, []);

  const loadRecord = async () => {
    try {
      const saved = await AsyncStorage.getItem("popular_record");
      if (saved !== null) {
        setPopularRecord(parseInt(saved));
      }
    } catch (e) {
      console.error("Errore caricamento record");
    }
  };

  const navigateTo = (path: any) => {
    if (vibrate) vibrate("light");
    router.push(path);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Header con Profilo e Livello */}
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
              {user ? "BENTORNATO," : "CIAO,"}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user ? (user.displayName || "Giocatore") : "Accedi al Profilo"}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={[styles.levelBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.levelText, { color: colors.primary }]}>LV. 1</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Banner: Dilemma del Giorno */}
        <TouchableOpacity 
          style={styles.dailySection}
          onPress={() => navigateTo("/daily-dilemma")}
          activeOpacity={0.9}
        >
          <LinearGradient colors={["#FF512F", "#DD2476"]} style={styles.dailyCard}>
            <View style={styles.dailyInfo}>
              <View style={styles.dailyTagContainer}>
                <Ionicons name="time-outline" size={12} color="#fff" />
                <Text style={styles.dailyTag}>DILEMMA DEL GIORNO</Text>
              </View>
              <Text style={styles.dailyTitle}>Preferiresti viaggiare nel{'\n'}passato o nel futuro?</Text>
              <Text style={styles.dailySubtitle}>12.540 persone hanno già scelto</Text>
            </View>
            <View style={styles.dailyIconContainer}>
              <Ionicons name="help-buoy" size={60} color="rgba(255,255,255,0.25)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.subtitleContainer}>
          <Text style={[styles.subtitle, { color: colors.text }]}>Modalità di Gioco</Text>
        </View>

        <View style={styles.menuContainer}>
          
          {/* Modalità Classica */}
          <TouchableOpacity onPress={() => navigateTo("/categories")} activeOpacity={0.8}>
            <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.modeButton}>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>Classica</Text>
                <Text style={styles.modeSubtitle}>Tutte le categorie</Text>
              </View>
              <Ionicons name="apps" size={50} color="rgba(255,255,255,0.3)" style={styles.modeIcon} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.row}>
            {/* Popolare */}
            <TouchableOpacity 
              style={styles.halfButton} 
              onPress={() => navigateTo("/popular")} 
              activeOpacity={0.8}
            >
              <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.smallModeButton}>
                <Ionicons name="flame" size={28} color="#fff" />
                <Text style={styles.smallModeTitle}>Popolari</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sfida Amico */}
            <TouchableOpacity 
              style={styles.halfButton} 
              onPress={() => navigateTo("/online")} 
              activeOpacity={0.8}
            >
              <LinearGradient colors={["#f093fb", "#f5576c"]} style={styles.smallModeButton}>
                <Ionicons name="people" size={28} color="#fff" />
                <Text style={styles.smallModeTitle}>Amici</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mini Statistiche di riepilogo aggiornate */}
        <View style={styles.bottomStats}>
          <View style={[styles.statBox, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.text }]}>{popularRecord}</Text>
              <Ionicons name="trophy" size={14} color="#FFD700" style={{marginLeft: 5}} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Record Popolari</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>0%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rarità</Text>
          </View>
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
    paddingVertical: 15,
    justifyContent: "space-between",
    alignItems: "center"
  },
  profileSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarContainer: { width: 45, height: 45, borderRadius: 22.5, justifyContent: "center", alignItems: "center" },
  welcomeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  userName: { fontSize: 16, fontWeight: "800" },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  levelText: { fontSize: 11, fontWeight: "900" },
  
  scrollContent: { paddingBottom: 40 },
  
  dailySection: { paddingHorizontal: 20, marginTop: 10 },
  dailyCard: { 
    padding: 24, 
    borderRadius: 30, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 12,
    shadowColor: "#DD2476",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  dailyInfo: { flex: 1 },
  dailyTagContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.15)', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 20, 
    alignSelf: 'flex-start', 
    marginBottom: 12,
    gap: 5
  },
  dailyTag: { color: '#fff', fontSize: 10, fontWeight: '900' },
  dailyTitle: { color: '#fff', fontSize: 20, fontWeight: '900', lineHeight: 26 },
  dailySubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 10 },
  dailyIconContainer: { marginLeft: 10 },
  
  subtitleContainer: { paddingHorizontal: 25, marginTop: 35, marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
  
  menuContainer: { paddingHorizontal: 20, gap: 15 },
  modeButton: { 
    padding: 25, 
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    height: 120,
  },
  modeTextContainer: { zIndex: 1 },
  modeTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  modeSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },
  modeIcon: { position: 'absolute', right: -5, bottom: -5 },

  row: { flexDirection: 'row', gap: 15 },
  halfButton: { flex: 1 },
  smallModeButton: { 
    height: 100, 
    borderRadius: 25, 
    padding: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8 
  },
  smallModeTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },

  bottomStats: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 25, gap: 15 },
  statBox: { flex: 1, padding: 18, borderRadius: 22, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '600' }
});