import React, { useState, useEffect, useRef } from "react";
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
import { useSettings } from "./contexts/SettingsContext";
import { supabase } from "../lib/supabase";

interface Question {
  id: string;
  category: string;
  option_a: string;
  option_b: string;
}

export default function ProfileGame() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { colors, vibrate } = useSettings();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);

  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  // 🔹 carica domande
  const loadQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("id, category, option_a, option_b")
      .eq("category", category);

    if (error) {
      Alert.alert("Errore", "Impossibile caricare le domande");
      setQuestions([]);
    } else {
      setQuestions(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, [category]);

  // 🔹 scelta utente (PROFILE)
  const handleChoice = async (choice: "A" | "B") => {
    if (locked) return;

    vibrate("medium");
    setLocked(true);
    setSelectedChoice(choice);

    const q = questions[currentIndex];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Errore", "Utente non autenticato");
      return;
    }

    const { error } = await supabase.from("user_answers").insert({
      user_id: user.id,
      question_id: q.id,
      choice,
    });

    if (error) {
      Alert.alert("Errore", "Impossibile salvare la risposta");
      return;
    }

    const scale = choice === "A" ? scaleA : scaleB;

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setTimeout(handleNext, 350);
  };

  const handleNext = () => {
    vibrate("light");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setLocked(false);
    } else {
      router.push("/profile-result");
    }
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
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Caricamento domande...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Nessuna domanda disponibile.
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

  const q = questions[currentIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          PROFILO
        </Text>
      </View>

      {/* Game */}
      <Pressable style={styles.gameContainer}>
        <Animated.View style={[styles.optionWrapper, { transform: [{ scale: scaleA }] }]}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: colors.cardBackground },
              selectedChoice === "A" && styles.selectedOption,
            ]}
            onPress={() => handleChoice("A")}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {q.option_a}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={[styles.orCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.orText}>O</Text>
        </View>

        <Animated.View style={[styles.optionWrapper, { transform: [{ scale: scaleB }] }]}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: colors.cardBackground },
              selectedChoice === "B" && styles.selectedOption,
            ]}
            onPress={() => handleChoice("B")}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {q.option_b}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backIcon: { width: 40 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  optionWrapper: { marginVertical: 12 },
  optionButton: {
    minHeight: 180,
    borderRadius: 24,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: "#4ade80",
  },
  optionText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  orCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  orText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
