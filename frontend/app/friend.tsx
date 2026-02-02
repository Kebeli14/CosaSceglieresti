import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Pressable,
} from "react-native";
import { useSettings } from "./contexts/SettingsContext";

export default function Friend() {
  const { colors, vibrate } = useSettings();
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({ percentageA: 50, percentageB: 50 }); // esempio

  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const options = ["Opzione A 🤪", "Opzione B 😜"];

  const handleChoice = (choice: "A" | "B") => {
    if (showStats) return;

    vibrate("medium");
    setSelectedChoice(choice);
    setShowStats(true);

    // animazione
    const scale = choice === "A" ? scaleA : scaleB;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Conosci il tuo amico</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scegli cosa pensi che il tuo amico preferisca
      </Text>

      <Pressable style={styles.gameContainer}>
        {/* Option A */}
        <Animated.View style={[styles.optionWrapper, { transform: [{ scale: scaleA }] }]}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: colors.cardBackground },
              selectedChoice === "A" && showStats && styles.selectedOption,
            ]}
            onPress={() => handleChoice("A")}
            disabled={showStats}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{options[0]}</Text>
            {showStats && (
              <View style={styles.statsOverlay}>
                <Text style={styles.percentageText}>{stats.percentageA}%</Text>
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
              { backgroundColor: colors.cardBackground },
              selectedChoice === "B" && showStats && styles.selectedOption,
            ]}
            onPress={() => handleChoice("B")}
            disabled={showStats}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{options[1]}</Text>
            {showStats && (
              <View style={styles.statsOverlay}>
                <Text style={styles.percentageText}>{stats.percentageB}%</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginTop: 20 },
  subtitle: { fontSize: 16, textAlign: "center", marginTop: 8 },
  gameContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  optionWrapper: { marginVertical: 12 },
  optionButton: {
    minHeight: 180,
    borderRadius: 24,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedOption: { borderColor: "#4ade80" },
  optionText: { fontSize: 22, fontWeight: "700", textAlign: "center", lineHeight: 32 },
  orCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  orText: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  statsOverlay: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "rgba(255,255,255,0.2)",
    width: "100%",
    alignItems: "center",
  },
  percentageText: { fontSize: 36, fontWeight: "800", color: "#4ade80" },
});
