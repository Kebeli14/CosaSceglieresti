import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../lib/supabase";

// Essenziale per gestire il ritorno all'app sui browser mobili
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const { colors, vibrate } = useSettings();

  const handleGoogleLogin = async () => {
    if (vibrate) vibrate("medium");

    try {
      const redirectUrl = AuthSession.makeRedirectUri({
      scheme: "frontend",
      // per Expo Go
      // @ts-ignore
      useProxy: true,
});

      console.log("Redirect URL:", redirectUrl);

      // Chiediamo a Supabase l'URL per login OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // va bene per Expo Go
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("OAuth URL non generato");

      // Apriamo la sessione OAuth dentro l'app
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      console.log("RESULT:", result);

      if (result.type === "success" && result.url) {
        // Estrai i parametri dalla query string usando URLSearchParams
        const queryString = result.url.split("?")[1];
        const params = new URLSearchParams(queryString);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (!sessionError) {
            router.replace("/profile");
          } else {
            console.error("Errore sessione:", sessionError.message);
            Alert.alert("Errore Sessione", sessionError.message);
          }
        } else {
          router.replace("/profile"); // fallback se PKCE ha gestito tutto automaticamente
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      Alert.alert("Errore di Accesso", err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
          <Ionicons name="logo-google" size={50} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Accesso Rapido</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Usa il tuo account Google per salvare i progressi e giocare online.
        </Text>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.loginText}>Continua con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Magari più tardi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  content: { alignItems: "center", paddingHorizontal: 35 },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "900", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 40 },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loginText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  backButton: { marginTop: 25, padding: 10 },
  backText: { fontSize: 15, fontWeight: "600" },
});
