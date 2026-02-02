import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSettings } from "./contexts/SettingsContext";




export default function Friend() {
  const { colors, vibrate } = useSettings();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = ["Opzione A", "Opzione B"]; // sostituire con dati reali

  const handleSelect = (option: string) => {
    vibrate("light");
    setSelected(option);
  };

  const handleSubmit = () => {
    if (selected) {
      setSubmitted(true);
      // qui puoi collegare il backend per registrare la scelta
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Conosci il tuo amico
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scegli cosa pensi che il tuo amico preferisca
      </Text>

      <View style={{ marginTop: 40, gap: 20 }}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  selected === opt ? colors.primary : colors.card,
              },
            ]}
            onPress={() => handleSelect(opt)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                { color: selected === opt ? "#fff" : colors.text },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>
            {submitted ? "Scelta Registrata" : "Invia Scelta"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", marginTop: 8 },
  optionButton: {
    padding: 22,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: { fontSize: 18, fontWeight: "600" },
  submitButton: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  submitText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
