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
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DailyReward from "../components/Dailyreward";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, vibrate } = useSettings();
  const { user } = useAuth();
  const { coins, username, avatarColor } = useUser();

  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
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

    if (nextSunday <= now) nextSunday.setDate(nextSunday.getDate() + 7);

    const diff = nextSunday.getTime() - now.getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);

    setTimeLeft(d > 0 ? `${d}g ${h}h` : `${h}h ${m}m`);
  };

  const navigateTo = (path) => {
    if (vibrate) vibrate("light");
    router.push(path);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      <DailyReward />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileSection} onPress={() => navigateTo("/profile")}>
          {/* Avatar colorato con iniziale username */}
          <View style={[styles.avatarContainer, { backgroundColor: avatarColor + "30", borderColor: avatarColor, borderWidth: 2 }]}>
            <Text style={[styles.avatarInitial, { color: avatarColor }]}>
              {username ? username[0].toUpperCase() : "?"}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {username ?? (user ? "Profilo" : "Accedi")}
          </Text>
        </TouchableOpacity>

        {/* Badge monete stilizzato */}
        <View style={styles.coinsBadge}>
          <View style={styles.coinCircle}>
            <Text style={styles.coinSymbol}>C</Text>
          </View>
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
  avatarInitial: {
    fontSize: 20,
    fontWeight: "900",
  },

  userName: {
    fontWeight: "800",
    fontSize: 16,
  },

  coinsBadge: {
    flexDirection: "row",
    backgroundColor: "#FFD70018",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#FFD70040",
  },
  coinCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  coinSymbol: {
    color: "#7a5c00",
    fontWeight: "900",
    fontSize: 13,
  },
  coinsText: {
    color: "#FFD700",
    fontWeight: "900",
    fontSize: 16,
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