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
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

export default function Game() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { colors, vibrate } = useSettings();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<{ percentageA: number; percentageB: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuestions();
  }, [category]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase.from("questions").select("*");
      if (category !== "random") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      }
    } catch (err) {
      Alert.alert("Errore", "Impossibile caricare le domande");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (choice: "A" | "B") => {
    if (showStats) {
      handleNext();
      return;
    }

    vibrate("medium");
    const q = questions[currentIndex];
    const totalVotes = q.votes_a + q.votes_b + 1;
    
    setStats({
      percentageA: ((choice === "A" ? q.votes_a + 1 : q.votes_a) / totalVotes) * 100,
      percentageB: ((choice === "B" ? q.votes_b + 1 : q.votes_b) / totalVotes) * 100,
    });

    setShowStats(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    const updates = choice === "A" ? { votes_a: q.votes_a + 1 } : { votes_b: q.votes_b + 1 };
    await supabase.from("questions").update(updates).eq("id", q.id);
  };

  const handleNext = () => {
    vibrate("light");
    if (currentIndex < questions.length - 1) {
      fadeAnim.setValue(0);
      setShowStats(false);
      setStats(null);
      setCurrentIndex(currentIndex + 1);
    } else {
      router.navigate("/categories");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" hidden={true} />

      {/* OPZIONE A - ROSSO */}
      <Pressable 
        style={[styles.fullOption, { backgroundColor: "#FF595E" }]} 
        onPress={() => handlePress("A")}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{currentQuestion?.option_a}</Text>
          {showStats && (
            <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>
              {stats?.percentageA.toFixed(0)}%
            </Animated.Text>
          )}
        </View>
      </Pressable>

      {/* BADGE "OPPURE" - INGRANDITO E CENTRATO */}
      <View style={styles.midBadge}>
        <Text style={styles.midText}>OPPURE</Text>
      </View>

      {/* OPZIONE B - BLU */}
      <Pressable 
        style={[styles.fullOption, { backgroundColor: "#1982C4" }]} 
        onPress={() => handlePress("B")}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.optionText}>{currentQuestion?.option_b}</Text>
          {showStats && (
            <Animated.Text style={[styles.statText, { opacity: fadeAnim }]}>
              {stats?.percentageB.toFixed(0)}%
            </Animated.Text>
          )}
        </View>
      </Pressable>

      {/* TASTO X */}
      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity 
          onPress={() => router.navigate("/categories")} 
          style={styles.backCircle}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1,
    zIndex: 999 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  headerOverlay: { 
    position: "absolute", 
    top: 40, 
    left: 20, 
    zIndex: 1000 
  },
  backCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "rgba(0,0,0,0.3)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  fullOption: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 30 
  },
  contentContainer: { 
    alignItems: "center", 
    width: "100%" 
  },
  optionText: { 
    fontSize: 28, 
    fontWeight: "900", 
    color: "white", 
    textAlign: "center", 
    textTransform: "uppercase" 
  },
  statText: { 
    fontSize: 65, 
    fontWeight: "900", 
    color: "rgba(255,255,255,0.8)", 
    marginTop: 20
  },
  midBadge: { 
    position: "absolute", 
    top: '50%',
    left: '50%',
    // Ingrandito: Altezza da 40 a 50, Larghezza da 90 a 110
    marginTop: -25, 
    marginLeft: -55, 
    width: 110, 
    height: 50, 
    backgroundColor: "#111", 
    borderRadius: 25, 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 10, 
    borderWidth: 3, // Bordo leggermente più spesso
    borderColor: "white" 
  },
  midText: { 
    color: "white", 
    fontWeight: "900", 
    fontSize: 15, // Testo ingrandito da 12 a 15
    letterSpacing: 1 // Leggermente più distanziato per stile
  },
});