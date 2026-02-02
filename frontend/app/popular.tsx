import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useSettings } from "./contexts/SettingsContext";


type Question = {
  id: string;
  option_a: string;
  option_b: string;
  votes_a: number;
  votes_b: number;
};

export default function Popular() {
  const { colors, vibrate } = useSettings();
  const [question, setQuestion] = useState<Question | null>(null);
  const [voted, setVoted] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    loadQuestion();
  }, []);

  async function loadQuestion() {
    const { data, error } = await supabase
      .from("popular_questions")
      .select("*")
      .limit(1)
      .single();

    if (!error) setQuestion(data);
  }

  async function vote(option: "A" | "B") {
    if (!question) return;

    vibrate("light");

    const updates =
      option === "A"
        ? { votes_a: question.votes_a + 1 }
        : { votes_b: question.votes_b + 1 };

    await supabase
      .from("popular_questions")
      .update(updates)
      .eq("id", question.id);

    setVoted(option);
    setQuestion({
      ...question,
      ...updates,
    });
  }

  if (!question) return <Text>Caricamento...</Text>;

  const total = question.votes_a + question.votes_b;
  const percentA = total ? Math.round((question.votes_a / total) * 100) : 0;
  const percentB = total ? Math.round((question.votes_b / total) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!voted ? (
        <>
          <TouchableOpacity onPress={() => vote("A")}>
            <LinearGradient colors={["#2563eb", "#3b82f6"]} style={styles.card}>
              <Text style={styles.text}>{question.option_a}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => vote("B")}>
            <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.card}>
              <Text style={styles.text}>{question.option_b}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.result}>
            {question.option_a}: {percentA}%
          </Text>
          <Text style={styles.result}>
            {question.option_b}: {percentB}%
          </Text>

          <TouchableOpacity onPress={loadQuestion}>
            <Text style={styles.next}>Prossima</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  card: {
    padding: 30,
    borderRadius: 22,
  },
  text: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  result: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  next: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 18,
    color: "#2563eb",
  },
});
