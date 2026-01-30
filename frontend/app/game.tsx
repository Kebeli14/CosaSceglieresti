import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import questionsData from "../data/questions.json";
import { supabase } from '../lib/supabase'


interface Question {
  _id: string;
  category: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
}

interface Stats {
  votesA: number;
  votesB: number;
  percentageA: number;
  percentageB: number;
}

export default function Game() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { colors, vibrate } = useSettings();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);

 useEffect(() => {
    async function loadFromSupabase() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')

      if (error) {
        console.error('Supabase error:', error)
      } else {
        console.log('DATI DA SUPABASE:', data)
      }
    }

    loadFromSupabase()
  }, []);


  const scaleA = new Animated.Value(1);
  const scaleB = new Animated.Value(1);
  const statsOpacity = new Animated.Value(0);

  useEffect(() => {
    loadQuestions();
  }, [category]);

  const loadQuestions = () => {
    setLoading(true);
    try {
      if (category && questionsData[category]) {
        setQuestions(questionsData[category]);
      } else {
        Alert.alert("Errore", "Categoria non trovata.");
        setQuestions([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Errore", "Impossibile caricare le domande.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (choice: "A" | "B") => {
    if (showStats) return;

    vibrate("medium");
    setSelectedChoice(choice);

    const currentQuestion = questions[currentIndex];

    // Aggiorna i voti
    if (choice === "A") currentQuestion.votesA += 1;
    else currentQuestion.votesB += 1;

    const totalVotes = currentQuestion.votesA + currentQuestion.votesB;
    const statsData: Stats = {
      votesA: currentQuestion.votesA,
      votesB: currentQuestion.votesB,
      percentageA: (currentQuestion.votesA / totalVotes) * 100,
      percentageB: (currentQuestion.votesB / totalVotes) * 100,
    };

    setStats(statsData);
    setShowStats(true);
    Animated.timing(statsOpacity, {
  toValue: 1,
  duration: 250,
  useNativeDriver: true,
}).start();


    const scale = choice === "A" ? scaleA : scaleB;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    vibrate("light");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowStats(false);
      setStats(null);
      setSelectedChoice(null);
      statsOpacity.setValue(0);
    } else {
      Alert.alert("Fine!", "Hai completato tutte le domande!", [
        { text: "Altra categoria", onPress: () => router.back() },
        { text: "Rigioca", onPress: resetGame },
      ]);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setShowStats(false);
    setStats(null);
    setSelectedChoice(null);
    statsOpacity.setValue(0);
  };

  const handleBack = () => {
    vibrate("light");
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Caricamento domande...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Nessuna domanda disponibile per questa categoria.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Torna indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {category?.toString().toUpperCase()}
        </Text>
      </View>

      {/* Game Area: cliccando sullo schermo passa alla prossima domanda */}
      <Pressable style={styles.gameContainer} onPress={showStats ? handleNext : undefined}
      >
        {/* Option A */}
        <Animated.View style={[styles.optionWrapper, { transform: [{ scale: scaleA }] }]}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              styles.optionA,
              { backgroundColor: colors.cardBackground },
              selectedChoice === "A" && showStats && styles.selectedOption,
            ]}
            onPress={() => handleChoice("A")}
            disabled={showStats}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{currentQuestion.optionA}</Text>
            {showStats && stats && (
            <View style={styles.statsOverlay}>
          <Text style={styles.percentageText}>{stats.percentageA.toFixed(1)}%</Text>
        </View>
      )}

          </TouchableOpacity>
        </Animated.View>

        {/* OR Circle */}
        <View style={[styles.orCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.orText}>O</Text>
        </View>

        {/* Option B */}
        <Animated.View style={[styles.optionWrapper, { transform: [{ scale: scaleB }] }]}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              styles.optionB,
              { backgroundColor: colors.cardBackground },
              selectedChoice === "B" && showStats && styles.selectedOption,
            ]}
            onPress={() => handleChoice("B")}
            disabled={showStats}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{currentQuestion.optionB}</Text>
            {showStats && stats && (
            <View style={styles.statsOverlay}>
            <Text style={styles.percentageText}>{stats.percentageB.toFixed(1)}%</Text>
          </View>
          )}

          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backIcon: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center" },
  headerRight: { width: 40, alignItems: "flex-end" },
  questionCounter: { fontSize: 16, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { fontSize: 18, marginTop: 16, textAlign: "center" },
  gameContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  optionWrapper: { marginVertical: 12 },
  optionButton: { minHeight: 180, borderRadius: 24, padding: 24, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 3, borderColor: "transparent" },
  optionA: {},
  optionB: {},
  selectedOption: { borderColor: "#4ade80" },
  optionText: { fontSize: 22, fontWeight: "700", textAlign: "center", lineHeight: 32 },
  orCircle: { width: 64, height: 64, borderRadius: 32, alignSelf: "center", justifyContent: "center", alignItems: "center", marginVertical: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  orText: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  statsOverlay: { marginTop: 16, paddingTop: 16, borderTopWidth: 2, borderTopColor: "rgba(255,255,255,0.2)", width: "100%", alignItems: "center" },
  percentageText: { fontSize: 36, fontWeight: "800", color: "#4ade80" },
  votesText: { fontSize: 16, color: "#9ca3af", marginTop: 4 },
  backButton: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  backButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
