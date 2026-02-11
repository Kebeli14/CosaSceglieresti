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
  
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    loadRecord();
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  const updateCountdown = () => {
    const now = new Date();
    const nextSunday = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 0, 0);

    if (nextSunday <= now) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    const diff = nextSunday.getTime() - now.getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);

    if (d > 0) {
      setTimeLeft(`${d}g ${h}h`);
    } else {
      setTimeLeft(`${h}h ${m}m`);
    }
  };

  const loadRecord = async () => {
    try {
      const saved = await AsyncStorage.getItem("popular_record");
      if (saved !== null) setPopularRecord(parseInt(saved));
    } catch (e) {
      console.error("Errore record");
    }
  };

  const navigateTo = (path: string) => {
    if (vibrate) vibrate("light");
    router.push(path as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileSection} onPress={() => navigateTo("/profile")}>
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
        
        {/* Banner: Dilemma della Settimana */}
        <TouchableOpacity 
          style={styles.dailySection}
          onPress={() => navigateTo("/daily-dilemma")}
          activeOpacity={0.9}
        >
          <LinearGradient colors={["#FFD700", "#FFA500"]} style={styles.dailyCard}>
            <View style={styles.dailyInfo}>
              <View style={styles.dailyTagContainer}>
                <Ionicons name="timer-outline" size={12} color="#000" />
                <Text style={styles.dailyTag}>RISULTATI TRA: {timeLeft}</Text>
              </View>
              <Text style={styles.dailyTitle}>Indovina la scelta{'\n'}della massa!</Text>
              <Text style={styles.dailySubtitle}>Vota e scala la classifica</Text>
            </View>
            <View style={styles.dailyIconContainer}>
              <Ionicons name="trophy" size={55} color="rgba(0,0,0,0.2)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.subtitleContainer}>
          <Text style={[styles.subtitle, { color: colors.text }]}>Modalità di Gioco</Text>
        </View>

        <View style={styles.menuContainer}>
          {/* Modalità Classica AGGIORNATA */}
          <TouchableOpacity onPress={() => navigateTo("/categories")} activeOpacity={0.8}>
            <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.modeButton}>
              <View style={styles.modeTextContainer}>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>ESPLORA</Text>
                </View>
                <Text style={styles.modeTitle}>Classica</Text>
                <View style={styles.discoverRow}>
                   <Text style={styles.modeSubtitle}>Prova le diverse categorie</Text>
                   <Ionicons name="arrow-forward-circle" size={16} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
              <Ionicons name="layers" size={80} color="rgba(255,255,255,0.2)" style={styles.modeIcon} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity style={styles.halfButton} onPress={() => navigateTo("/popular")} activeOpacity={0.8}>
              <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.smallModeButton}>
                <Ionicons name="flame" size={28} color="#fff" />
                <Text style={styles.smallModeTitle}>Popolari</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.halfButton} onPress={() => navigateTo("/online")} activeOpacity={0.8}>
              <LinearGradient colors={["#f093fb", "#f5576c"]} style={styles.smallModeButton}>
                <Ionicons name="people" size={28} color="#fff" />
                <Text style={styles.smallModeTitle}>Amici</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

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
  header: { flexDirection: "row", paddingHorizontal: 25, paddingVertical: 15, justifyContent: "space-between", alignItems: "center" },
  profileSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarContainer: { width: 45, height: 45, borderRadius: 22.5, justifyContent: "center", alignItems: "center" },
  welcomeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  userName: { fontSize: 16, fontWeight: "800" },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  levelText: { fontSize: 11, fontWeight: "900" },
  scrollContent: { paddingBottom: 40 },
  dailySection: { paddingHorizontal: 20, marginTop: 10 },
  dailyCard: { padding: 24, borderRadius: 30, flexDirection: 'row', alignItems: 'center', elevation: 8, shadowColor: '#FFA500', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 5} },
  dailyInfo: { flex: 1 },
  dailyTagContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', 
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12, gap: 5
  },
  dailyTag: { color: '#000', fontSize: 10, fontWeight: '900' },
  dailyTitle: { fontSize: 20, fontWeight: '900', lineHeight: 26, color: '#000' },
  dailySubtitle: { fontSize: 12, marginTop: 10, color: 'rgba(0,0,0,0.6)' },
  dailyIconContainer: { marginLeft: 10 },
  subtitleContainer: { paddingHorizontal: 25, marginTop: 35, marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
  menuContainer: { paddingHorizontal: 20, gap: 15 },
  
  // MODALITÀ CLASSICA STYLES
  modeButton: { padding: 25, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 140, overflow: 'hidden', elevation: 5 },
  modeTextContainer: { zIndex: 1, justifyContent: 'center' },
  newBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  modeTitle: { color: "#fff", fontSize: 32, fontWeight: "900", letterSpacing: -0.5 },
  discoverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  modeSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  modeIcon: { position: 'absolute', right: -10, bottom: -10 },

  row: { flexDirection: 'row', gap: 15 },
  halfButton: { flex: 1 },
  smallModeButton: { height: 110, borderRadius: 25, padding: 20, justifyContent: 'center', alignItems: 'center', gap: 8 },
  smallModeTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  bottomStats: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 25, gap: 15 },
  statBox: { flex: 1, padding: 18, borderRadius: 22, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '600' }
});