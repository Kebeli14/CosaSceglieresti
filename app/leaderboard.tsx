import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

type ScoreRow = {
  id: string;
  display_name: string;
  score: number;
  user_id: string | null;
};

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_ICONS  = ["🥇", "🥈", "🥉"];

function avatarColor(name: string): string {
  const palette = ["#7c3aed", "#0ea5e9", "#f59e0b", "#ec4899", "#10b981", "#ef4444", "#f97316", "#6366f1"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function Avatar({ name, size = 42 }: { name: string; size?: number }) {
  const color = avatarColor(name);
  return (
    <View style={[avStyle.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + "25", borderColor: color }]}>
      <Text style={[avStyle.letter, { color, fontSize: size * 0.42 }]}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </Text>
    </View>
  );
}
const avStyle = StyleSheet.create({
  circle: { justifyContent: "center", alignItems: "center", borderWidth: 2 },
  letter: { fontWeight: "900" },
});

export default function Leaderboard() {
  const { colors } = useSettings();
  const { username, bestStreak } = useUser();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchScores(); }, []);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("id, display_name, score, user_id")
        .order("score", { ascending: false })
        .limit(500);
      if (error) throw error;

      // Deduplicazione per user_id (utenti loggati hanno 1 riga ciascuno)
      // Fallback su display_name per eventuali righe anonime vecchie
      const seenUserIds = new Set<string>();
      const seenNames = new Set<string>();
      const deduped = (data ?? []).filter(row => {
        if (row.user_id) {
          if (seenUserIds.has(row.user_id)) return false;
          seenUserIds.add(row.user_id);
          return true;
        } else {
          if (seenNames.has(row.display_name)) return false;
          seenNames.add(row.display_name);
          return true;
        }
      }).slice(0, 30);

      setScores(deduped);
    } catch (e) {
      console.error("Errore classifica:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScores();
  }, []);

  // Cerca per user_id se loggato, altrimenti per display_name
  const myRankIndex = scores.findIndex(s =>
    user?.id ? s.user_id === user.id : s.display_name === username
  );
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const myScoreInBoard = myRankIndex >= 0 ? scores[myRankIndex].score : null;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Caricamento classifica...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary + "18", "transparent"]} style={styles.bgGradient} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: colors.text }]}>🏆 Classifica Streak</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Basata sulla modalità Popolari
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {scores.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nessun punteggio ancora!</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Gioca alla modalità Popolari e scala la classifica 🔥
            </Text>
          </View>
        ) : (
          <View style={[styles.listCard, { backgroundColor: colors.cardBackground }]}>
            {scores.map((row, i) => {
              const rank = i + 1;
              const isMe = row.display_name === username;
              const color = avatarColor(row.display_name);
              const isTop3 = rank <= 3;

              return (
                <View
                  key={row.id}
                  style={[
                    styles.row,
                    { borderBottomColor: colors.background },
                    isMe && { backgroundColor: colors.primary + "12" },
                    i === scores.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  {/* Rank */}
                  {isTop3 ? (
                    <Text style={styles.rankEmoji}>{RANK_ICONS[rank - 1]}</Text>
                  ) : (
                    <Text style={[styles.rankNum, { color: isMe ? colors.primary : colors.textSecondary }]}>
                      {rank}
                    </Text>
                  )}

                  {/* Avatar */}
                  <Avatar name={row.display_name} size={40} />

                  {/* Nome */}
                  <Text
                    style={[styles.name, { color: isMe ? colors.primary : colors.text, fontWeight: isMe ? "900" : "700" }]}
                    numberOfLines={1}
                  >
                    {row.display_name}{isMe ? " · tu" : ""}
                  </Text>

                  {/* Punteggio */}
                  <View style={[styles.scorePill, { backgroundColor: isTop3 ? RANK_COLORS[rank - 1] + "22" : colors.background }]}>
                    <Text style={styles.fireEmoji}>🔥</Text>
                    <Text style={[styles.scoreText, { color: isTop3 ? RANK_COLORS[rank - 1] : colors.primary }]}>
                      {row.score}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Barra fissa in basso — posizione utente */}
      <View style={[
        styles.myBar,
        { backgroundColor: colors.cardBackground, paddingBottom: insets.bottom + 10, borderTopColor: colors.primary + "20" },
      ]}>
        {username ? (
          <>
            <Avatar name={username} size={38} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.myName, { color: colors.text }]}>
                {username}
                {myRank ? `  ·  #${myRank} in classifica` : "  ·  Non ancora in classifica"}
              </Text>
              <Text style={[styles.myStreakLabel, { color: colors.textSecondary }]}>
                {bestStreak > 0
                  ? `Il tuo miglior streak: 🔥 ${bestStreak}`
                  : "Gioca per entrare in classifica!"}
              </Text>
            </View>
            {myScoreInBoard !== null && (
              <View style={[styles.scorePill, { backgroundColor: colors.primary + "18" }]}>
                <Text style={styles.fireEmoji}>🔥</Text>
                <Text style={[styles.scoreText, { color: colors.primary }]}>{myScoreInBoard}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={[styles.myName, { color: colors.textSecondary }]}>
            Accedi con Google per comparire in classifica 🏆
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  bgGradient:   { position: "absolute", top: 0, left: 0, right: 0, height: 300 },
  header:       { paddingHorizontal: 20, paddingBottom: 14 },
  title:        { fontSize: 26, fontWeight: "900" },
  subtitle:     { fontSize: 13, marginTop: 2, opacity: 0.7 },
  loadingText:  { marginTop: 12, fontSize: 14 },

  listCard:     { marginHorizontal: 16, borderRadius: 24, overflow: "hidden", marginTop: 4 },
  row:          {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  rankEmoji:    { fontSize: 22, width: 32, textAlign: "center" },
  rankNum:      { width: 32, fontSize: 15, fontWeight: "900", textAlign: "center" },
  name:         { flex: 1, fontSize: 15 },
  scorePill:    { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  fireEmoji:    { fontSize: 13 },
  scoreText:    { fontWeight: "900", fontSize: 15 },

  emptyWrap:    { alignItems: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyEmoji:   { fontSize: 64, marginBottom: 16 },
  emptyTitle:   { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  emptySub:     { textAlign: "center", lineHeight: 22, fontSize: 14 },

  myBar:        {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 14,
    borderTopWidth: 1.5,
  },
  myName:       { fontSize: 14, fontWeight: "800" },
  myStreakLabel:{ fontSize: 12, marginTop: 2 },
});
