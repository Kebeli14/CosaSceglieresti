import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const { colors, vibrate } = useSettings();

  // Funzione per login con Google
  const handleGoogleLogin = async () => {
    vibrate("medium");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;

      // L'utente sarà reindirizzato automaticamente a Supabase login page
      // Qui puoi mostrare un alert o messaggio
      Alert.alert("Login", "Verrai reindirizzato per accedere con Google");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Errore", err.message || "Impossibile eseguire il login");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Ionicons name="log-in-outline" size={80} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Login Google</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Accedi per salvare le tue preferenze e sfidare gli amici
        </Text>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleGoogleLogin}
        >
          <Ionicons name="logo-google" size={22} color="#fff" />
          <Text style={styles.loginText}>Accedi con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: colors.text }]}>Torna indietro</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { alignItems: "center", paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 20 },
  subtitle: { fontSize: 16, marginTop: 12, textAlign: "center" },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  loginText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  backButton: { marginTop: 24 },
  backText: { fontSize: 16, fontWeight: "600" },
});
