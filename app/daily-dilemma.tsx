import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Pressable,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../lib/supabase";

export default function DailyDilemma() {
  const router = useRouter(); 
  const { vibrate } = useSettings();

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [userChoice, setUserChoice] = useState<"A" | "B" | null>(null);
  const [stats, setStats] = useState<{ percentageA: number; percentageB: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchWeeklyDilemma();
  }, []);

  const fetchWeeklyDilemma = async () => {
    setLoading(true);
    try {
      let { data: q } = await supabase.from("questions").select("*").eq("is_weekly_special", true).limit(1).maybeSingle();

      if (!q) {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
        const { data: automatic } = await supabase.from("questions").select("*").range(weekNumber, weekNumber).single();
        q = automatic;
      }

      if (q) {
        setQuestion(q);
        const savedChoice = await AsyncStorage.getItem(`voted_${q.id}`);
        if (savedChoice) {
          setUserChoice(savedChoice as "A" | "B");
          calculateStats(q, savedChoice as "A" | "B", false);
          setShowStats(true);
          fadeAnim.setValue(1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (q: any, choice: "A" | "B", isNewVote: boolean) => {
    const vA = isNewVote && choice === "A" ? q.votes_a + 1 : q.votes_a;
    const vB = isNewVote && choice === "B" ? q.votes_b + 1 : q.votes_b;
    const total = vA + vB || 1;
    setStats({ percentageA: (vA / total) * 100, percentageB: (vB / total) * 100 });
  };

  const handlePress = async (choice: "A" | "B") => {
    if (showStats) return;
    if (vibrate) vibrate("medium");
    setUserChoice(choice);
    calculateStats(question, choice, true);
    setShowStats(true);

    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    await supabase.from("questions").update(choice === "A" ? { votes_a: question.votes_a + 1 } : { votes_b: question.votes_b + 1 }).eq("id", question.id);
    await AsyncStorage.setItem(`voted_${question.id}`, choice);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) return <View style={[styles.center, { backgroundColor: "#000" }]}><ActivityIndicator size="large" color="#FF595E" /></View>;
  if (!question) return null;

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden={true} />

      {/* OPZIONE A */}
      <Pressable 
        style={[
          styles.fullOption, 
          { backgroundColor: "#FF595E" },
          userChoice === "A" && styles.selectedBorder
        ]} 
        onPress={() => handlePress("A")} 
        disabled={showStats}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{question.option_a}</Text>
          {showStats && (
            <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>
              {stats?.percentageA.toFixed(0)}%
            </Animated.Text>
          )}
        </View>
      </Pressable>

      {/* BADGE CENTRALE CON DILEMMA E SETTIMANALE */}
      <View style={styles.midBadgeContainer}>
        {/* DILEMMA - Sinistra */}
        <View style={styles.sideBadge}>
          <Text style={styles.sideBadgeText}>DILEMMA</Text>
        </View>

        {/* OPPURE - Centro */}
        <View style={styles.midBadge}>
          <Text style={styles.midText}>OPPURE</Text>
        </View>

        {/* SETTIMANALE - Destra */}
        <View style={styles.sideBadge}>
          <Text style={styles.sideBadgeText}>SETTIMANALE</Text>
        </View>
      </View>

      {/* OPZIONE B */}
      <Pressable 
        style={[
          styles.fullOption, 
          { backgroundColor: "#1982C4" },
          userChoice === "B" && styles.selectedBorder
        ]} 
        onPress={() => handlePress("B")} 
        disabled={showStats}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{question.option_b}</Text>
          {showStats && (
            <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>
              {stats?.percentageB.toFixed(0)}%
            </Animated.Text>
          )}
        </View>
      </Pressable>

      {/* CLOSE BUTTON - Alto destra */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={goBack}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 8
  },
  fullOption: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 30,
    borderWidth: 0,
  },
  selectedBorder: {
    borderWidth: 6,
    borderColor: '#39FF14',
    zIndex: 5,
  },
  contentContainer: { alignItems: "center", width: "100%" },
  optionText: { 
    fontSize: 28, fontWeight: "900", color: "white", 
    textAlign: "center", textTransform: "uppercase" 
  },
  statText: { 
    fontSize: 65, fontWeight: "900", color: "rgba(255,255,255,0.8)", marginTop: 10 
  },
  midBadgeContainer: {
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    zIndex: 10, 
    marginLeft: -230,
    marginTop: -25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 460
  },
  midBadge: { 
    width: 110, 
    height: 50, 
    backgroundColor: "#111", 
    borderRadius: 25, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 3, 
    borderColor: "white" 
  },
  midText: { 
    color: "white", 
    fontWeight: "900", 
    fontSize: 15, 
    letterSpacing: 1 
  },
  sideBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  sideBadgeText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5
  }
});