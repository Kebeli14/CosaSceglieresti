import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../lib/supabase";
import * as Linking from 'expo-linking'; // Fondamentale per il redirect su mobile

export default function Login() {
  const router = useRouter();
  const { colors, vibrate } = useSettings();

  // Funzione per login con Google
  const handleGoogleLogin = async () => {
    if (vibrate) vibrate("medium");

    // Crea l'URL che riporta l'utente a questa app (usa lo scheme 'frontend' definito in app.json)
    const redirectUrl = Linking.createURL("/profile");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      // Se Supabase restituisce un URL di autenticazione, lo apriamo nel browser
      if (data?.url) {
        const result = await Linking.openURL(data.url);
      }
      
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