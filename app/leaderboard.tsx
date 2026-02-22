import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// ─── Tipi ─────────────────────────────────────────────────────────────────────
type Period = "week" | "month" | "alltime";
type Tab    = "global" | "friends";

type Player = {
  id: number;
  name: string;
  points: number;
  rank: number;
  avatarColor: string; // colore sfondo avatar
  isYou?: boolean;
};

// ─── Dati finti ───────────────────────────────────────────────────────────────
// 👇 Sostituisci con fetch Supabase in futuro
const FAKE_DATA: Record<Tab, Record<Period, Player[]>> = {
  global: {
    week: [
      { id: 1, name: "Ivan",   points: 2540, rank: 1,  avatarColor: "#7c3aed" },
      { id: 2, name: "David",  points: 2100, rank: 2,  avatarColor: "#0ea5e9" },
      { id: 3, name: "Austin", points: 1850, rank: 3,  avatarColor: "#f59e0b" },
      { id: 4, name: "Sofia",  points: 1500, rank: 4,  avatarColor: "#ec4899" },
      { id: 5, name: "Luca",   points: 1420, rank: 5,  avatarColor: "#10b981" },
      { id: 6, name: "Marco",  points: 1380, rank: 6,  avatarColor: "#ef4444" },
      { id: 7, name: "Giulia", points: 1200, rank: 7,  avatarColor: "#f97316" },
      { id: 8, name: "Tu",     points:  890, rank: 24, avatarColor: "#6366f1", isYou: true },
    ],
    month: [
      { id: 1, name: "Austin", points: 8200, rank: 1,  avatarColor: "#f59e0b" },
      { id: 2, name: "Ivan",   points: 7900, rank: 2,  avatarColor: "#7c3aed" },
      { id: 3, name: "Giulia", points: 6700, rank: 3,  avatarColor: "#f97316" },
      { id: 4, name: "Sofia",  points: 6200, rank: 4,  avatarColor: "#ec4899" },
      { id: 5, name: "Marco",  points: 5900, rank: 5,  avatarColor: "#ef4444" },
      { id: 6, name: "David",  points: 5400, rank: 6,  avatarColor: "#0ea5e9" },
      { id: 7, name: "Luca",   points: 4800, rank: 7,  avatarColor: "#10b981" },
      { id: 8, name: "Tu",     points: 3100, rank: 18, avatarColor: "#6366f1", isYou: true },
    ],
    alltime: [
      { id: 1, name: "David",  points: 42000, rank: 1, avatarColor: "#0ea5e9" },
      { id: 2, name: "Ivan",   points: 38500, rank: 2, avatarColor: "#7c3aed" },
      { id: 3, name: "Sofia",  points: 31200, rank: 3, avatarColor: "#ec4899" },
      { id: 4, name: "Austin", points: 28800, rank: 4, avatarColor: "#f59e0b" },
      { id: 5, name: "Luca",   points: 22400, rank: 5, avatarColor: "#10b981" },
      { id: 6, name: "Marco",  points: 19900, rank: 6, avatarColor: "#ef4444" },
      { id: 7, name: "Giulia", points: 17300, rank: 7, avatarColor: "#f97316" },
      { id: 8, name: "Tu",     points: 12600, rank: 41, avatarColor: "#6366f1", isYou: true },
    ],
  },
  friends: {
    week: [
      { id: 1, name: "Marco",  points: 1380, rank: 1, avatarColor: "#ef4444" },
      { id: 2, name: "Sofia",  points: 1200, rank: 2, avatarColor: "#ec4899" },
      { id: 3, name: "Tu",     points:  890, rank: 3, avatarColor: "#6366f1", isYou: true },
      { id: 4, name: "Giulia", points:  740, rank: 4, avatarColor: "#f97316" },
    ],
    month: [
      { id: 1, name: "Sofia",  points: 5100, rank: 1, avatarColor: "#ec4899" },
      { id: 2, name: "Tu",     points: 3100, rank: 2, avatarColor: "#6366f1", isYou: true },
      { id: 3, name: "Marco",  points: 2900, rank: 3, avatarColor: "#ef4444" },
      { id: 4, name: "Giulia", points: 2200, rank: 4, avatarColor: "#f97316" },
    ],
    alltime: [
      { id: 1, name: "Marco",  points: 19900, rank: 1, avatarColor: "#ef4444" },
      { id: 2, name: "Giulia", points: 17300, rank: 2, avatarColor: "#f97316" },
      { id: 3, name: "Sofia",  points: 14100, rank: 3, avatarColor: "#ec4899" },
      { id: 4, name: "Tu",     points: 12600, rank: 4, avatarColor: "#6366f1", isYou: true },
    ],
  },
};

const PERIOD_LABELS: Record<Period, string> = {
  week:    "Settimana",
  month:   "Mese",
  alltime: "Sempre",
};

const PODIUM_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

// ─── Avatar colorato ──────────────────────────────────────────────────────────
function PlayerAvatar({ color, size = 50, textSize = 18, name }: { color: string; size?: number; textSize?: number; name: string }) {
  return (
    <View style={[avatarStyles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + "33", borderColor: color, borderWidth: 2 }]}>
      <Text style={[avatarStyles.initial, { fontSize: textSize, color }]}>{name[0]?.toUpperCase()}</Text>
    </View>
  );
}
const avatarStyles = StyleSheet.create({
  circle: { justifyContent: "center", alignItems: "center" },
  initial: { fontWeight: "900" },
});

// ─── Schermata principale ─────────────────────────────────────────────────────
export default function Leaderboard() {
  const { colors } = useSettings();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [tab, setTab]       = useState<Tab>("global");
  const [period, setPeriod] = useState<Period>("week");

  const allPlayers = FAKE_DATA[tab][period];
  const top3       = allPlayers.filter((p) => p.rank <= 3).sort((a, b) => a.rank - b.rank);
  const rest       = allPlayers.filter((p) => p.rank > 3 && !p.isYou);
  const me         = allPlayers.find((p) => p.isYou);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary + "18", "transparent"]} style={styles.bgGradient} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerSide} />
        <Text style={[styles.standardTitle, { color: colors.text }]}>Classifica</Text>
        <View style={styles.headerSide} />
      </View>

      {/* Tab Globale / Amici */}
      <View style={[styles.tabRow, { backgroundColor: colors.cardBackground }]}>
        {(["global", "friends"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
            onPress={() => setTab(t)}
          >
            <Ionicons
              name={t === "global" ? "globe-outline" : "people-outline"}
              size={15}
              color={tab === t ? "#fff" : colors.textSecondary}
            />
            <Text style={[styles.tabText, { color: tab === t ? "#fff" : colors.textSecondary }]}>
              {t === "global" ? "Globale" : "Amici"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pills periodo */}
      <View style={styles.periodRow}>
        {(["week", "month", "alltime"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodPill, { borderColor: colors.primary + "50" }, period === p && { backgroundColor: colors.primary + "22" }]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, { color: period === p ? colors.primary : colors.textSecondary }]}>
              {PERIOD_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Podio */}
        {top3.length === 3 && (
          <View style={styles.podiumWrapper}>
            {/* 2° */}
            <View style={styles.podiumColumn}>
              <PlayerAvatar color={top3[1].avatarColor} size={70} textSize={26} name={top3[1].name} />
              <View style={[styles.badge, { backgroundColor: PODIUM_COLORS[1] }]}>
                <Text style={styles.badgeText}>2</Text>
              </View>
              <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>{top3[1].name}</Text>
              <LinearGradient colors={[PODIUM_COLORS[1], PODIUM_COLORS[1] + "50"]} style={[styles.podiumBar, { height: 80 }]}>
                <Text style={styles.barPoints}>{top3[1].points.toLocaleString()}</Text>
              </LinearGradient>
            </View>

            {/* 1° */}
            <View style={styles.podiumColumn}>
              <Ionicons name="ribbon" size={28} color={PODIUM_COLORS[0]} style={styles.crownIcon} />
              <PlayerAvatar color={top3[0].avatarColor} size={88} textSize={34} name={top3[0].name} />
              <View style={[styles.badge, { backgroundColor: PODIUM_COLORS[0], width: 26, height: 26, borderRadius: 13 }]}>
                <Text style={[styles.badgeText, { fontSize: 13 }]}>1</Text>
              </View>
              <Text style={[styles.podiumName, { color: colors.text, fontSize: 16, fontWeight: "900" }]} numberOfLines={1}>{top3[0].name}</Text>
              <LinearGradient colors={[PODIUM_COLORS[0], PODIUM_COLORS[0] + "50"]} style={[styles.podiumBar, { height: 120 }]}>
                <Text style={styles.barPoints}>{top3[0].points.toLocaleString()}</Text>
              </LinearGradient>
            </View>

            {/* 3° */}
            <View style={styles.podiumColumn}>
              <PlayerAvatar color={top3[2].avatarColor} size={62} textSize={22} name={top3[2].name} />
              <View style={[styles.badge, { backgroundColor: PODIUM_COLORS[2] }]}>
                <Text style={styles.badgeText}>3</Text>
              </View>
              <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>{top3[2].name}</Text>
              <LinearGradient colors={[PODIUM_COLORS[2], PODIUM_COLORS[2] + "50"]} style={[styles.podiumBar, { height: 60 }]}>
                <Text style={styles.barPoints}>{top3[2].points.toLocaleString()}</Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Lista posizioni 4+ */}
        <View style={[styles.listContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.listHeader, { color: colors.textSecondary }]}>
            {tab === "global" ? `TOP 10 — ${PERIOD_LABELS[period].toUpperCase()}` : `AMICI — ${PERIOD_LABELS[period].toUpperCase()}`}
          </Text>
          {rest.map((player) => (
            <View key={player.id} style={[styles.playerRow, { borderBottomColor: colors.background }]}>
              <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>{player.rank}</Text>
              <PlayerAvatar color={player.avatarColor} size={38} textSize={15} name={player.name} />
              <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
              <Text style={[styles.playerPoints, { color: colors.primary }]}>{player.points.toLocaleString()} pt</Text>
            </View>
          ))}
        </View>

        {/* La tua posizione — fissa in fondo */}
        {me && (
          <View style={[styles.myPositionBar, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
            <PlayerAvatar color={me.avatarColor} size={38} textSize={15} name={me.name} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.myName, { color: colors.text }]}>
                Tu {user?.user_metadata?.full_name ? `· ${user.user_metadata.full_name}` : ""}
              </Text>
              <Text style={[styles.myRank, { color: colors.textSecondary }]}>#{me.rank} nel {tab === "global" ? "mondo" : "gruppo"}</Text>
            </View>
            <Text style={[styles.myPoints, { color: colors.primary }]}>{me.points.toLocaleString()} pt</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  bgGradient:   { position: "absolute", top: 0, left: 0, right: 0, height: 400 },
  header:       { height: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, zIndex: 10 },
  headerSide:   { width: 40 },
  standardTitle:{ fontSize: 24, fontWeight: "900", textAlign: "center", flex: 1, letterSpacing: 1 },

  // Tab
  tabRow:       { flexDirection: "row", marginHorizontal: 20, borderRadius: 16, padding: 4, marginBottom: 14 },
  tabBtn:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12 },
  tabText:      { fontSize: 14, fontWeight: "700" },

  // Periodo
  periodRow:    { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 10 },
  periodPill:   { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  periodText:   { fontSize: 13, fontWeight: "700" },

  // Podio
  podiumWrapper:{ flexDirection: "row", justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 15, marginTop: 10, height: 290 },
  podiumColumn: { flex: 1, alignItems: "center" },
  podiumBar:    { width: "85%", borderTopLeftRadius: 12, borderTopRightRadius: 12, justifyContent: "flex-start", alignItems: "center", paddingTop: 10, marginTop: 6 },
  barPoints:    { color: "#fff", fontWeight: "900", fontSize: 11, textShadowColor: "rgba(0,0,0,0.3)", textShadowRadius: 3, textShadowOffset: { width: 1, height: 1 } },
  badge:        { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff", marginTop: -10, zIndex: 5 },
  badgeText:    { color: "#fff", fontWeight: "bold", fontSize: 10 },
  crownIcon:    { marginBottom: -8, zIndex: 5 },
  podiumName:   { fontWeight: "800", marginTop: 10, fontSize: 13, width: "90%", textAlign: "center" },

  // Lista
  listContainer:{ marginHorizontal: 20, marginTop: 20, borderRadius: 24, paddingVertical: 10, ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14 }, android: { elevation: 6 } }) },
  listHeader:   { fontSize: 11, fontWeight: "900", textAlign: "center", marginBottom: 8, letterSpacing: 1, opacity: 0.6 },
  playerRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 18, borderBottomWidth: 1, gap: 12 },
  rankNumber:   { width: 28, fontSize: 15, fontWeight: "900" },
  playerName:   { flex: 1, fontSize: 15, fontWeight: "700" },
  playerPoints: { fontWeight: "900", fontSize: 14 },

  // La tua posizione
  myPositionBar:{ flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 14, borderWidth: 1.5 },
  myName:       { fontSize: 15, fontWeight: "800" },
  myRank:       { fontSize: 12, marginTop: 2 },
  myPoints:     { fontSize: 16, fontWeight: "900" },
});