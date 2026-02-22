import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "../contexts/SettingsContext";

// ─── Ricompense dei 7 giorni ──────────────────────────────────────────────────
const REWARDS = [
  { day: 1, coins: 10,  label: "Giorno 1" },
  { day: 2, coins: 10,  label: "Giorno 2" },
  { day: 3, coins: 15,  label: "Giorno 3" },
  { day: 4, coins: 20 ,  label: "Giorno 4" },
  { day: 5, coins: 25,  label: "Giorno 5" },
  { day: 6, coins: 30, label: "Giorno 6" },
  { day: 7, coins: 50, label: "Bonus!", isBig: true },
];

const STORAGE_KEY_LAST   = "daily_reward_last_date";
const STORAGE_KEY_STREAK = "daily_reward_streak";
const STORAGE_KEY_COINS  = "coins"; // stessa chiave usata nel resto dell'app

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function isYesterday(date: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(date, yesterday);
}

type Props = {
  onClose?: () => void;
};

export default function DailyReward({ onClose }: Props) {
  const { colors, vibrate } = useSettings();

  const [visible, setVisible]         = useState(false);
  const [streak, setStreak]           = useState(1);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [claimed, setClaimed]         = useState(false);

  // Animazione moneta
  const coinScale  = useRef(new Animated.Value(0)).current;
  const coinOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAndShow();
  }, []);

  const checkAndShow = async () => {
    const lastDateStr = await AsyncStorage.getItem(STORAGE_KEY_LAST);
    const savedStreak = await AsyncStorage.getItem(STORAGE_KEY_STREAK);
    const today = new Date();

    let currentStreak = savedStreak ? parseInt(savedStreak) : 0;

    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);

      // Già riscosso oggi
      if (isSameDay(lastDate, today)) {
        setAlreadyClaimed(true);
        setStreak(currentStreak);
        // Non mostrare il popup se già riscosso oggi
        return;
      }

      // Streak continua se ieri aveva giocato
      if (isYesterday(lastDate, today)) {
        currentStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
      } else {
        // Streak interrotto
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    setStreak(currentStreak);
    setVisible(true);
  };

  const claimReward = async () => {
    if (claimed) return;
    if (vibrate) vibrate("medium");

    const reward = REWARDS[streak - 1];
    const today  = new Date();

    // Salva data e streak
    await AsyncStorage.setItem(STORAGE_KEY_LAST, today.toISOString());
    await AsyncStorage.setItem(STORAGE_KEY_STREAK, streak.toString());

    // Aggiorna monete
    const savedCoins = await AsyncStorage.getItem(STORAGE_KEY_COINS);
    const current = savedCoins ? parseInt(savedCoins) : 0;
    await AsyncStorage.setItem(STORAGE_KEY_COINS, (current + reward.coins).toString());

    setClaimed(true);

    // Animazione
    Animated.parallel([
      Animated.spring(coinScale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(coinOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const todayReward = REWARDS[streak - 1];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.cardBackground }]}>

          {/* Titolo */}
          <Text style={styles.emoji}>🎁</Text>
          <Text style={[styles.title, { color: colors.text }]}>Ricompensa Giornaliera</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Accedi ogni giorno per guadagnare monete!
          </Text>

          {/* Griglia 7 giorni */}
          <View style={styles.grid}>
            {REWARDS.map((r) => {
              const isDone    = r.day < streak;
              const isToday   = r.day === streak;
              const isLocked  = r.day > streak;

              return (
                <View
                  key={r.day}
                  style={[
                    styles.dayBox,
                    { backgroundColor: colors.background },
                    isDone  && styles.dayDone,
                    isToday && { borderColor: "#FFD700", borderWidth: 2, backgroundColor: "#FFD70015" },
                    r.isBig && { width: "100%" },
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark-circle" size={22} color="#4ade80" />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={18} color={colors.textSecondary} style={{ opacity: 0.4 }} />
                  ) : (
                    <Text style={styles.coinEmoji}>🪙</Text>
                  )}
                  <Text style={[
                    styles.dayCoins,
                    { color: isDone ? "#4ade80" : isLocked ? colors.textSecondary : "#FFD700" },
                    isLocked && { opacity: 0.4 },
                  ]}>
                    {r.coins}
                  </Text>
                  <Text style={[styles.dayLabel, { color: colors.textSecondary }, isLocked && { opacity: 0.4 }]}>
                    {r.label}
                  </Text>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>OGGI</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Animazione monete dopo claim */}
          {claimed && (
            <Animated.View style={[styles.claimedBox, { opacity: coinOpacity, transform: [{ scale: coinScale }] }]}>
              <Text style={styles.claimedEmoji}>🪙</Text>
              <Text style={styles.claimedText}>+{todayReward.coins} monete!</Text>
            </Animated.View>
          )}

          {/* Bottone */}
          {!claimed ? (
            <TouchableOpacity
              style={[styles.claimBtn, { backgroundColor: "#FFD700" }]}
              onPress={claimReward}
              activeOpacity={0.85}
            >
              <Text style={styles.claimBtnText}>Ritira 🪙 {todayReward.coins}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={handleClose}
            >
              <Text style={styles.closeBtnText}>Continua</Text>
            </TouchableOpacity>
          )}

          {/* Skip */}
          {!claimed && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleClose}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>Più tardi</Text>
            </TouchableOpacity>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  sheet:         { width: "100%", borderRadius: 28, padding: 24, alignItems: "center", gap: 10 },
  emoji:         { fontSize: 48, marginBottom: 4 },
  title:         { fontSize: 22, fontWeight: "900", textAlign: "center" },
  sub:           { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 8 },

  // Griglia
  grid:          { flexDirection: "row", flexWrap: "wrap", gap: 8, width: "100%", justifyContent: "center", marginBottom: 8 },
  dayBox:        { width: "28%", borderRadius: 14, padding: 10, alignItems: "center", gap: 3, position: "relative", borderWidth: 1.5, borderColor: "transparent" },
  dayDone:       { borderColor: "#4ade8044" },
  coinEmoji:     { fontSize: 20 },
  dayCoins:      { fontSize: 15, fontWeight: "900" },
  dayLabel:      { fontSize: 10, fontWeight: "600" },
  todayBadge:    { position: "absolute", top: -8, backgroundColor: "#FFD700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  todayBadgeText:{ fontSize: 8, fontWeight: "900", color: "#000" },

  // Claimed
  claimedBox:    { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, backgroundColor: "#FFD70022" },
  claimedEmoji:  { fontSize: 28 },
  claimedText:   { fontSize: 22, fontWeight: "900", color: "#FFD700" },

  // Bottoni
  claimBtn:      { width: "100%", padding: 16, borderRadius: 18, alignItems: "center", marginTop: 4 },
  claimBtnText:  { fontSize: 18, fontWeight: "900", color: "#000" },
  closeBtn:      { width: "100%", padding: 16, borderRadius: 18, alignItems: "center", marginTop: 4 },
  closeBtnText:  { fontSize: 18, fontWeight: "900", color: "#fff" },
  skipBtn:       { padding: 10 },
  skipText:      { fontSize: 14, fontWeight: "600" },
});