import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Pressable,
  Dimensions,
  StatusBar,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function PopularGame() {
  const router = useRouter();
  const { colors, vibrate } = useSettings();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState<{ pA: number; pB: number } | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [userChoice, setUserChoice] = useState<"A" | "B" | null>(null); // Nuovo stato per il bordo

  // Animazioni
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState("transparent");

  useEffect(() => {
    loadPopularQuestions();
  }, []);

  const loadPopularQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("questions").select("*");
      if (error) throw error;
      if (data) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveHighScore = async (finalScore: number) => {
    try {
      const currentRecord = await AsyncStorage.getItem("popular_record");
      const recordValue = currentRecord ? parseInt(currentRecord) : 0;

      if (finalScore > recordValue) {
        await AsyncStorage.setItem("popular_record", finalScore.toString());
      }
    } catch (e) {
      console.error("Errore salvataggio record:", e);
    }
  };

  const handleGuess = async (choice: "A" | "B") => {
    if (showResult) return;

    setUserChoice(choice); // Memorizza la scelta per il bordo
    const q = questions[currentIndex];
    const total = q.votes_a + q.votes_b;
    const safeTotal = total === 0 ? 1 : total;
    const pA = (q.votes_a / safeTotal) * 100;
    const pB = (q.votes_b / safeTotal) * 100;

    setStats({ pA, pB });
    setShowResult(true);
    
    const isCorrect = choice === "A" ? q.votes_a >= q.votes_b : q.votes_b >= q.votes_a;
    
    setFlashColor(isCorrect ? "#4ADE80" : "#EF4444");
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.4, duration: 100, useNativeDriver: false }),
      Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start();

    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    if (isCorrect) {
      vibrate("light");
      setScore(prev => prev + 1);
    } else {
      vibrate("error");
      await saveHighScore(score);
      setTimeout(() => setShowGameOver(true), 800);
    }
  };

  const resetGame = () => {
    setScore(0);
    setCurrentIndex(0);
    setShowResult(false);
    setShowGameOver(false);
    setStats(null);
    setUserChoice(null); // Reset scelta
    fadeAnim.setValue(0);
    loadPopularQuestions();
  };

  const handleNext = () => {
    if (!showResult || showGameOver) return;
    fadeAnim.setValue(0);
    setShowResult(false);
    setStats(null);
    setUserChoice(null); // Reset scelta per la prossima domanda
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.navigate("/");
    }
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color="#FF595E" />
    </View>
  );

  const q = questions[currentIndex];

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden={true} />
      <Animated.View style={[styles.flashOverlay, { backgroundColor: flashColor, opacity: flashAnim }]} pointerEvents="none" />

      {/* OPZIONE A */}
      <Pressable 
        style={[
          styles.fullOption, 
          { backgroundColor: "#FF595E" },
          userChoice === "A" && styles.selectedBorder // Applica bordo se scelta
        ]} 
        onPress={() => showResult ? handleNext() : handleGuess("A")}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{q?.option_a}</Text>
          {showResult && <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>{stats?.pA.toFixed(0)}%</Animated.Text>}
        </View>
      </Pressable>

      <View style={styles.midBadge}><Text style={styles.midText}>OPPURE</Text></View>

      {/* OPZIONE B */}
      <Pressable 
        style={[
          styles.fullOption, 
          { backgroundColor: "#1982C4" },
          userChoice === "B" && styles.selectedBorder // Applica bordo se scelta
        ]} 
        onPress={() => showResult ? handleNext() : handleGuess("B")}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{q?.option_b}</Text>
          {showResult && <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>{stats?.pB.toFixed(0)}%</Animated.Text>}
        </View>
      </Pressable>

      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => router.navigate("/")} style={styles.backCircle}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreLabel}>STREAK</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </SafeAreaView>

      {/* MODAL GAME OVER RIMANE UGUALE */}
      <Modal visible={showGameOver} transparent={true} animationType="slide">
        <View style={styles.gameOverContainer}>
          <View style={styles.gameOverContent}>
            <View style={styles.lossIconContainer}><Ionicons name="skull" size={60} color="white" /></View>
            <Text style={styles.lossTitle}>PECCATO!</Text>
            <View style={styles.finalScoreBox}>
              <Text style={styles.finalScoreLabel}>IL TUO PUNTEGGIO</Text>
              <Text style={styles.finalScoreValue}>{score}</Text>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
              <Text style={styles.retryButtonText}>RIPROVA ORA</Text>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitTextButton} onPress={() => router.navigate("/")}>
              <Text style={styles.exitText}>Torna alla Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, zIndex: 999 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  flashOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  headerOverlay: { position: "absolute", top: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 },
  backCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  scoreBadge: { backgroundColor: "rgba(0,0,0,0.5)", paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20, alignItems: 'center' },
  scoreLabel: { color: 'white', fontSize: 10, fontWeight: '700', opacity: 0.8 },
  scoreValue: { color: 'white', fontSize: 18, fontWeight: '900' },
  fullOption: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  // STILE PER IL BORDO SELEZIONATO
  selectedBorder: {
    borderWidth: 6,
    borderColor: '#39FF14', // Verde neon
    zIndex: 5,
  },
  contentContainer: { alignItems: "center", width: "100%" },
  optionText: { fontSize: 28, fontWeight: "900", color: "white", textAlign: "center", textTransform: "uppercase" },
  statText: { fontSize: 65, fontWeight: "900", color: "rgba(255,255,255,0.8)", marginTop: 20 },
  midBadge: { position: "absolute", top: '50%', left: '50%', marginTop: -25, marginLeft: -55, width: 110, height: 50, backgroundColor: "#111", borderRadius: 25, justifyContent: "center", alignItems: "center", zIndex: 10, borderWidth: 3, borderColor: "white" },
  midText: { color: "white", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  gameOverContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  gameOverContent: { width: '100%', alignItems: 'center', padding: 40 },
  lossIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FF595E', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 4, borderColor: 'white' },
  lossTitle: { fontSize: 50, fontWeight: "900", color: "white", marginBottom: 10, letterSpacing: -1 },
  finalScoreBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 25, alignItems: 'center', width: '100%', marginBottom: 40 },
  finalScoreLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  finalScoreValue: { color: 'white', fontSize: 80, fontWeight: '900' },
  retryButton: { backgroundColor: '#1982C4', width: '100%', paddingVertical: 20, borderRadius: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  retryButtonText: { color: 'white', fontSize: 22, fontWeight: '900', textTransform: 'uppercase' },
  exitTextButton: { marginTop: 25 },
  exitText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }
});