import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useRouter } from "expo-router";

export default function Friend() {
  const { colors, vibrate } = useSettings();
  const router = useRouter();

  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);

  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const options = ["Opzione A", "Opzione B"];

  const gradients = {
    A: ["#f97316", "#fb7185"], // arancio → rosa
    B: ["#3b82f6", "#06b6d4"], // blu → ciano
  };

  const handleChoice = (choice: "A" | "B") => {
    if (selectedChoice) return;

    vibrate("medium");
    setSelectedChoice(choice);

    const scale = choice === "A" ? scaleA : scaleB;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleBack = () => {
    Alert.alert(
      "Conferma",
      "Sei sicuro di voler tornare indietro? La tua scelta andrà persa.",
      [
        { text: "Annulla", style: "cancel" },
        { text: "Sì", onPress: () => router.back() },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Conosci il tuo amico</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scegli cosa pensi che preferisca
      </Text>

      {/* OPTIONS PUZZLE */}
      <View style={styles.optionsContainer}>
        {/* Opzione A */}
        <Animated.View style={{ flex: 1, transform: [{ scale: scaleA }] }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.9}
            onPress={() => handleChoice("A")}
          >
            <LinearGradient
              colors={gradients.A}
              style={[styles.optionCard, styles.optionCardTop, selectedChoice === "A" && styles.selectedGlow]}
            >
              <Text style={styles.optionText}>{options[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Cerchio “O” incastrato */}
        <View style={styles.orCircle}>
          <Text style={styles.orText}>O</Text>
        </View>

        {/* Opzione B */}
        <Animated.View style={{ flex: 1, transform: [{ scale: scaleB }] }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.9}
            onPress={() => handleChoice("B")}
          >
            <LinearGradient
              colors={gradients.B}
              style={[styles.optionCard, styles.optionCardBottom, selectedChoice === "B" && styles.selectedGlow]}
            >
              <Text style={styles.optionText}>{options[1]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backButton: { width: 40 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", flex: 1 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 16, color: "#888" },

  optionsContainer: { flex: 1, justifyContent: "center", position: "relative" },

  optionCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  optionCardTop: {
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginBottom: -32, // fa spazio per il cerchio
  },

  optionCardBottom: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -32, // fa spazio per il cerchio
  },

  optionText: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  selectedGlow: { borderWidth: 3, borderColor: "#FFFFFF" },

  orCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -32,
    marginTop: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFD700", // giallo oro
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10, // sopra le card
  },
  orText: { fontSize: 28, fontWeight: "900", color: "#000000" },
});
