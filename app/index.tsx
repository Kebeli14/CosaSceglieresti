import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DailyReward from "../components/Dailyreward";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, vibrate } = useSettings();
  const { user } = useAuth();

  const [popularRecord, setPopularRecord] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [displayName, setDisplayName] = useState("Giocatore");
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    loadRecord();
    loadName();
    loadCoins();
    updateCountdown();

    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadName();
      loadCoins();
    }, [])
  );

  const loadName = async () => {
    const saved = await AsyncStorage.getItem("display_name");
    setDisplayName(saved ?? user?.user_metadata?.full_name ?? "Giocatore");
  };

  const loadCoins = async () => {
    const saved = await AsyncStorage.getItem("coins");
    setCoins(saved ? parseInt(saved) : 0);
  };

  const updateCountdown = () => {
    const now = new Date();
    const nextSunday = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 0, 0);

    if (nextSunday <= now) nextSunday.setDate(nextSunday.getDate() + 7);

    const diff = nextSunday.getTime() - now.getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);

    setTimeLeft(d > 0 ? `${d}g ${h}h` : `${h}h ${m}m`);
  };

  const loadRecord = async () => {
    const saved = await AsyncStorage.getItem("popular_record");
    if (saved) setPopularRecord(parseInt(saved));
  };

  const navigateTo = (path) => {
    if (vibrate) vibrate("light");
    router.push(path);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      <DailyReward onClose={loadCoins} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileSection} onPress={() => navigateTo("/profile")}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user ? displayName : "Accedi al Profilo"}
          </Text>
        </TouchableOpacity>

        <View style={styles.coinsBadge}>
          <Text style={styles.coinsEmoji}>🪙</Text>
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* DAILY */}
        <TouchableOpacity
          style={styles.dailySection}
          onPress={() => navigateTo("/daily-dilemma")}
          activeOpacity={0.9}
        >
          <LinearGradient colors={["#FFD700", "#FFA500"]} style={styles.dailyCard}>
            <View style={styles.dailyInfo}>
              <Text style={styles.dailyTag}>RISULTATI TRA: {timeLeft}</Text>
              <Text style={styles.dailyTitle}>Indovina la scelta{"\n"}della massa!</Text>
            </View>
            <Ionicons name="trophy" size={55} color="rgba(0,0,0,0.2)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* TITOLO */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Modalità di Gioco
        </Text>

        {/* CLASSICA */}
        <TouchableOpacity onPress={() => navigateTo("/categories")} activeOpacity={0.8}>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.modeButton}>
            <View>
              <Text style={styles.modeTitle}>Classica</Text>
              <Text style={styles.modeSubtitle}>Prova le categorie</Text>
            </View>
            <Ionicons name="layers" size={80} color="rgba(255,255,255,0.2)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* POPOLARI (FULL WIDTH) */}
        <TouchableOpacity onPress={() => navigateTo("/popular")} activeOpacity={0.8}>
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.modeButton}>
            <View>
              <Text style={styles.modeTitle}>Popolari</Text>
              <Text style={styles.modeSubtitle}>Scopri cosa sceglie la massa</Text>
            </View>
            <Ionicons name="flame" size={80} color="rgba(255,255,255,0.2)" />
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  userName: {
    fontWeight: "800",
    fontSize: 16,
  },

  coinsBadge: {
    flexDirection: "row",
    backgroundColor: "#FFD70020",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    gap: 5,
  },

  coinsEmoji: { fontSize: 14 },

  coinsText: {
    color: "#FFD700",
    fontWeight: "900",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  dailySection: {
    padding: 20,
  },

  dailyCard: {
    padding: 20,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dailyInfo: {
    flex: 1,
  },

  dailyTag: {
    fontSize: 12,
    fontWeight: "900",
  },

  dailyTitle: {
    fontSize: 20,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 20,
    marginBottom: 10,
  },

  modeButton: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 25,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modeTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  modeSubtitle: {
    color: "#fff",
    marginTop: 5,
  },
});