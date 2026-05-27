import { Tabs } from "expo-router";
import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { UserProvider, useUser } from "../contexts/UserContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState, useEffect, Component, ReactNode } from "react";
import * as Linking from "expo-linking";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";

// ─── Error Boundary globale ───────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: "#1a1a2e", padding: 24, justifyContent: "center" }}>
          <Text style={{ color: "#ff4444", fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            ❌ Crash — Copia questo errore e mandalo allo sviluppatore:
          </Text>
          <ScrollView style={{ backgroundColor: "#0d0d0d", borderRadius: 8, padding: 12 }}>
            <Text style={{ color: "#00ff88", fontSize: 12, fontFamily: "monospace" }}>
              {this.state.error.toString()}{"\n\n"}{this.state.error.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SettingsProvider>
          <AuthProvider>
            <UserProvider>
              <StatusBar style="auto" />
              <LayoutContent />
            </UserProvider>
          </AuthProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// ─── Modal scelta username (solo per utenti loggati senza username) ────────────
function UsernameSetup() {
  const { username, usernameReady, setUsername, generateRandomUsername } = useUser();
  const { user } = useAuth();
  const { colors } = useSettings();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mostra il modal SOLO se l'utente è loggato e non ha ancora un username
  if (!user || !usernameReady || username) return null;

  const handleRandom = () => {
    setInput(generateRandomUsername());
    setError("");
  };

  const handleSave = async () => {
    if (input.trim().length < 3) return;
    setLoading(true);
    setError("");
    const result = await setUsername(input);
    if (!result.success) setError(result.error ?? "Errore");
    setLoading(false);
  };

  const canSave = input.trim().length >= 3 && !loading;

  return (
    <Modal visible transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={setupStyles.overlay}
      >
        <View style={[setupStyles.sheet, { backgroundColor: colors.cardBackground }]}>
          <Text style={setupStyles.emoji}>👤</Text>
          <Text style={[setupStyles.title, { color: colors.text }]}>Scegli il tuo username</Text>
          <Text style={[setupStyles.sub, { color: colors.textSecondary }]}>
            Sarà visibile nella classifica. Scegli con cura!
          </Text>

          <View style={[
            setupStyles.inputRow,
            {
              borderColor: error ? "#ef4444" : colors.primary + "50",
              backgroundColor: colors.background,
            },
          ]}>
            <TextInput
              style={[setupStyles.input, { color: colors.text }]}
              value={input}
              onChangeText={t => { setInput(t); setError(""); }}
              placeholder="Il tuo username..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <TouchableOpacity onPress={handleRandom} style={setupStyles.randomBtn}>
              <Ionicons name="shuffle" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {!!error && <Text style={setupStyles.errorText}>{error}</Text>}
          <Text style={[setupStyles.hint, { color: colors.textSecondary }]}>
            3–20 caratteri · lettere, numeri e _
          </Text>

          <TouchableOpacity
            style={[setupStyles.saveBtn, { backgroundColor: colors.primary, opacity: canSave ? 1 : 0.45 }]}
            onPress={handleSave}
            disabled={!canSave}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={setupStyles.saveBtnText}>Conferma username ✓</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRandom} style={setupStyles.randomLink}>
            <Ionicons name="shuffle-outline" size={16} color={colors.primary} />
            <Text style={[setupStyles.randomLinkText, { color: colors.primary }]}>
              Generami uno casuale
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Gestione deep link magic link ────────────────────────────────────────────
function DeepLinkHandler() {
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (!url) return;
      // I token arrivano nel fragment (#) dell'URL: frontend://login#access_token=...
      const fragment = url.split("#")[1];
      if (!fragment) return;
      const params = new URLSearchParams(fragment);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    };

    // App già aperta e arriva un deep link
    const sub = Linking.addEventListener("url", handleUrl);
    // App aperta da zero tramite deep link
    Linking.getInitialURL().then(url => { if (url) handleUrl({ url }); });
    return () => sub.remove();
  }, []);
  return null;
}

// ─── Layout principale con tab bar ────────────────────────────────────────────
function LayoutContent() {
  const { colors }: any = useSettings();

  return (
    <>
      <DeepLinkHandler />
      <UsernameSetup />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors?.primary || "#3b82f6",
          tabBarInactiveTintColor: colors?.textSecondary || "#666",
          tabBarStyle: {
            backgroundColor: colors?.cardBackground || "#fff",
            height: 75,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors?.border || "#eee",
          },
          tabBarItemStyle: { flex: 1 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{ title: "Classifica", tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "Profilo", tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }}
        />
        <Tabs.Screen name="login"        options={{ href: null }} />
        <Tabs.Screen name="categories"   options={{ href: null }} />
<Tabs.Screen name="popular"      options={{ href: null }} />
        <Tabs.Screen name="game"         options={{ href: null }} />
        <Tabs.Screen name="settings"     options={{ href: null }} />
        <Tabs.Screen name="daily-dilemma" options={{ href: null }} />
      </Tabs>
    </>
  );
}

const setupStyles = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  sheet:         { width: "100%", borderRadius: 28, padding: 28, alignItems: "center", gap: 10 },
  emoji:         { fontSize: 52, marginBottom: 2 },
  title:         { fontSize: 22, fontWeight: "900", textAlign: "center" },
  sub:           { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 4 },
  inputRow:      { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, width: "100%", height: 54 },
  input:         { flex: 1, fontSize: 16, fontWeight: "600" },
  randomBtn:     { padding: 6 },
  errorText:     { color: "#ef4444", fontSize: 13, fontWeight: "700", alignSelf: "flex-start" },
  hint:          { fontSize: 12, alignSelf: "flex-start", opacity: 0.7 },
  saveBtn:       { width: "100%", paddingVertical: 16, borderRadius: 18, alignItems: "center", marginTop: 8 },
  saveBtnText:   { color: "#fff", fontSize: 17, fontWeight: "900" },
  randomLink:    { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  randomLinkText:{ fontSize: 14, fontWeight: "700" },
});
