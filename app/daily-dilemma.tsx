import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Animated, Pressable, StatusBar, Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "../contexts/SettingsContext";
import { useUser } from "../contexts/UserContext";
import { supabase } from "../lib/supabase";

const REVEAL_DAY  = 0;   // 0 = domenica
const COIN_REWARD = 20;

function isRevealDay() {
  return new Date().getDay() === REVEAL_DAY;
}

export default function DailyDilemma() {
  const router    = useRouter();
  const { vibrate } = useSettings();
  const { addCoins } = useUser();

  const [question,       setQuestion]       = useState<any>(null);
  const [loading,        setLoading]        = useState(true);
  const [userChoice,     setUserChoice]     = useState<"A" | "B" | null>(null);
  const [showStats,      setShowStats]      = useState(false);   // true solo domenica
  const [stats,          setStats]          = useState<{ pA: number; pB: number } | null>(null);
  const [resultVisible,  setResultVisible]  = useState(false);
  const [isCorrect,      setIsCorrect]      = useState(false);
  const [alreadyRewarded, setAlreadyRewarded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const reveal   = isRevealDay();

  useEffect(() => { fetchWeeklyDilemma(); }, []);

  const fetchWeeklyDilemma = async () => {
    setLoading(true);
    try {
      let { data: q } = await supabase
        .from("questions")
        .select("*")
        .eq("is_weekly_special", true)
        .limit(1)
        .maybeSingle();

      if (!q) {
        const now   = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const week  = Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
        const { data: auto } = await supabase.from("questions").select("*").range(week, week).single();
        q = auto;
      }

      if (q) {
        setQuestion(q);
        const savedChoice  = await AsyncStorage.getItem(`voted_${q.id}`) as "A" | "B" | null;
        const rewarded     = await AsyncStorage.getItem(`rewarded_${q.id}`);
        setAlreadyRewarded(!!rewarded);

        if (savedChoice) {
          setUserChoice(savedChoice);
          // Mostra le percentuali solo la domenica
          if (reveal) {
            computeStats(q, savedChoice);
            setShowStats(true);
            fadeAnim.setValue(1);
            // Se non ha già ritirato il premio, mostra il risultato
            if (!rewarded) {
              await giveRewardIfCorrect(q, savedChoice);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (q: any, choice: "A" | "B") => {
    const vA    = q.votes_a || 0;
    const vB    = q.votes_b || 0;
    const total = vA + vB || 1;
    setStats({ pA: (vA / total) * 100, pB: (vB / total) * 100 });
    const winner = vA >= vB ? "A" : "B";
    setIsCorrect(choice === winner);
  };

  const giveRewardIfCorrect = async (q: any, choice: "A" | "B") => {
    const vA     = q.votes_a || 0;
    const vB     = q.votes_b || 0;
    const winner = vA >= vB ? "A" : "B";
    const correct = choice === winner;
    setIsCorrect(correct);

    if (correct) {
      await addCoins(COIN_REWARD);
    }
    await AsyncStorage.setItem(`rewarded_${q.id}`, "1");
    setAlreadyRewarded(true);

    // Piccolo ritardo per far vedere prima le percentuali
    setTimeout(() => setResultVisible(true), 700);
  };

  const handlePress = async (choice: "A" | "B") => {
    if (userChoice) return; // già votato
    if (vibrate) vibrate("medium");
    setUserChoice(choice);

    // Aggiorna DB
    const field = choice === "A" ? { votes_a: question.votes_a + 1 } : { votes_b: question.votes_b + 1 };
    await supabase.from("questions").update(field).eq("id", question.id);
    await AsyncStorage.setItem(`voted_${question.id}`, choice);

    // Dati aggiornati per le stats
    const updatedQ = {
      ...question,
      votes_a: choice === "A" ? question.votes_a + 1 : question.votes_a,
      votes_b: choice === "B" ? question.votes_b + 1 : question.votes_b,
    };

    if (reveal) {
      // È domenica → rivela subito + premia
      computeStats(updatedQ, choice);
      setShowStats(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      if (!alreadyRewarded) await giveRewardIfCorrect(updatedQ, choice);
    }
    // Se non è domenica → mostra solo la scelta, niente percentuali
  };

  /* ─── UI ─────────────────────────────────────────────────────── */
  if (loading) return (
    <View style={[styles.center, { backgroundColor: "#000" }]}>
      <ActivityIndicator size="large" color="#FF595E" />
    </View>
  );
  if (!question) return null;

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden />

      {/* OPZIONE A */}
      <Pressable
        style={[
          styles.fullOption,
          { backgroundColor: "#FF595E" },
          userChoice === "A" && styles.selectedBorder,
        ]}
        onPress={() => handlePress("A")}
        disabled={!!userChoice}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{question.option_a}</Text>

          {/* Domenica: mostra percentuale */}
          {showStats && stats && (
            <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>
              {stats.pA.toFixed(0)}%
            </Animated.Text>
          )}

          {/* Altri giorni: ha già votato questa → badge "Tua scelta" */}
          {!showStats && userChoice === "A" && (
            <View style={styles.chosenBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.chosenText}>La tua scelta</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* BADGE CENTRALE */}
      <View style={styles.midBadgeContainer}>
        <View style={styles.sideBadge}>
          <Text style={styles.sideBadgeText}>DILEMMA</Text>
        </View>
        <View style={styles.midBadge}>
          <Text style={styles.midText}>OPPURE</Text>
        </View>
        <View style={styles.sideBadge}>
          <Text style={styles.sideBadgeText}>SETTIMANALE</Text>
        </View>
      </View>

      {/* OPZIONE B */}
      <Pressable
        style={[
          styles.fullOption,
          { backgroundColor: "#1982C4" },
          userChoice === "B" && styles.selectedBorder,
        ]}
        onPress={() => handlePress("B")}
        disabled={!!userChoice}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{question.option_b}</Text>

          {showStats && stats && (
            <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>
              {stats.pB.toFixed(0)}%
            </Animated.Text>
          )}

          {!showStats && userChoice === "B" && (
            <View style={styles.chosenBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.chosenText}>La tua scelta</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Banner "risultati domenica" — visibile quando hai già votato ma non è domenica */}
      {userChoice && !reveal && (
        <View style={styles.waitBanner}>
          <Ionicons name="time-outline" size={16} color="#FFD700" />
          <Text style={styles.waitText}>I risultati si svelano domenica!</Text>
        </View>
      )}

      {/* X — sinistra, come le altre schermate */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={26} color="white" />
      </TouchableOpacity>

      {/* ─── POPUP RISULTATO ───────────────────────────────────── */}
      <Modal visible={resultVisible} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupEmoji}>{isCorrect ? "🎉" : "😔"}</Text>
            <Text style={styles.popupTitle}>
              {isCorrect ? "Hai indovinato!" : "Peccato!"}
            </Text>
            <Text style={styles.popupSub}>
              {isCorrect
                ? `Sei nella maggioranza! Ti abbiamo regalato ${COIN_REWARD} monete 🪙`
                : "La maggioranza ha scelto l'altra opzione. Riprova la settimana prossima!"}
            </Text>

            {isCorrect && (
              <View style={styles.coinReward}>
                <View style={styles.coinCircle}><Text style={styles.coinLetter}>C</Text></View>
                <Text style={styles.coinAmount}>+{COIN_REWARD}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.popupBtn, { backgroundColor: isCorrect ? "#4ade80" : "#FF595E" }]}
              onPress={() => { setResultVisible(false); router.back(); }}
            >
              <Text style={styles.popupBtnText}>
                {isCorrect ? "Ritira il premio 🎁" : "Chiudi"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer:     { flex: 1, backgroundColor: "#000" },
  center:            { flex: 1, justifyContent: "center", alignItems: "center" },

  fullOption:        { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  selectedBorder:    { borderWidth: 6, borderColor: "#39FF14", zIndex: 5 },
  contentContainer:  { alignItems: "center", width: "100%" },
  optionText:        { fontSize: 28, fontWeight: "900", color: "white", textAlign: "center", textTransform: "uppercase" },
  statText:          { fontSize: 65, fontWeight: "900", color: "rgba(255,255,255,0.85)", marginTop: 10 },

  chosenBadge:       {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  chosenText:        { color: "#fff", fontWeight: "800", fontSize: 14 },

  waitBanner:        {
    position: "absolute", bottom: 36, left: 0, right: 0,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  waitText:          { color: "#FFD700", fontWeight: "800", fontSize: 14 },

  // X sinistra
  closeButton:       {
    position: "absolute", top: 50, left: 20,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center", zIndex: 9999,
  },

  // Badge centrale
  midBadgeContainer: {
    position: "absolute", top: "50%", left: 0, right: 0,
    zIndex: 10, marginTop: -28,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 16,
  },
  midBadge:          {
    width: 115, height: 56, backgroundColor: "#111", borderRadius: 28,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "white",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 10,
  },
  midText:           { color: "white", fontWeight: "900", fontSize: 16, letterSpacing: 1.5 },
  sideBadge:         {
    backgroundColor: "#FFD700", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14,
    shadowColor: "#FFD700", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 8,
    borderWidth: 1.5, borderColor: "#FFA500",
  },
  sideBadgeText:     { color: "#000", fontWeight: "900", fontSize: 11, letterSpacing: 0.8 },

  // Popup risultato
  popupOverlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  popupBox:          { backgroundColor: "#1a1a1a", borderRadius: 28, padding: 32, alignItems: "center", gap: 12, width: "100%", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  popupEmoji:        { fontSize: 60 },
  popupTitle:        { fontSize: 26, fontWeight: "900", color: "#fff" },
  popupSub:          { fontSize: 15, color: "rgba(255,255,255,0.65)", textAlign: "center", lineHeight: 22 },
  coinReward:        { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  coinCircle:        { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFD700", justifyContent: "center", alignItems: "center" },
  coinLetter:        { color: "#7a5c00", fontWeight: "900", fontSize: 16 },
  coinAmount:        { color: "#FFD700", fontSize: 32, fontWeight: "900" },
  popupBtn:          { width: "100%", paddingVertical: 16, borderRadius: 18, alignItems: "center", marginTop: 8 },
  popupBtnText:      { color: "#fff", fontSize: 17, fontWeight: "900" },
});
