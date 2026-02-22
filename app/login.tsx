import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../lib/supabase";

type Mode = "email" | "magic" | "confirm";

export default function Login() {
  const router = useRouter();
  const { colors, vibrate } = useSettings();

  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert("Attenzione", "Inserisci email e password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password troppo corta", "Minimo 6 caratteri.");
      return;
    }
    // Validazione username in fase di registrazione
    if (isSignUp) {
      if (!username.trim()) {
        Alert.alert("Attenzione", "Scegli uno username.");
        return;
      }
      if (username.trim().length < 3) {
        Alert.alert("Username troppo corto", "Minimo 3 caratteri.");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        Alert.alert("Username non valido", "Usa solo lettere, numeri e underscore.");
        return;
      }
    }

    if (vibrate) vibrate("medium");
    setLoading(true);
    try {
      if (isSignUp) {
        // Controlla che lo username non sia già in uso
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", username.trim())
          .single();

        if (existing) {
          Alert.alert("Username già in uso", "Scegli un username diverso.");
          setLoading(false);
          return;
        }

        // Registrazione
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Salva il profilo con lo username
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            username: username.trim(),
          });
        }

        Alert.alert(
          "Registrazione effettuata! 🎉",
          "Controlla la tua email per confermare l'account, poi torna qui e accedi.",
          [{ text: "OK" }]
        );
        setIsSignUp(false);
        setUsername("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/profile");
      }
    } catch (err: any) {
      const msg = err.message || "Errore sconosciuto";
      if (msg.includes("Invalid login credentials")) {
        Alert.alert("Credenziali errate", "Email o password non corretti.");
      } else if (msg.includes("Email not confirmed")) {
        Alert.alert("Email non confermata", "Clicca il link che ti abbiamo inviato via email.");
      } else {
        Alert.alert("Errore", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      Alert.alert("Inserisci la tua email");
      return;
    }
    if (vibrate) vibrate("medium");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMode("confirm");
    } catch (err: any) {
      Alert.alert("Errore", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "confirm") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name="mail-open-outline" size={50} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Controlla la mail!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ti abbiamo inviato un link magico a{"\n"}
            <Text style={{ fontWeight: "800", color: colors.text }}>{email}</Text>
            {"\n\n"}Clicca il link per accedere automaticamente.
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => { setMode("magic"); setEmail(""); }}
          >
            <Text style={styles.loginText}>Cambia email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Torna all'app</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name="game-controller-outline" size={50} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {isSignUp ? "Crea account" : "Bentornato!"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === "email"
              ? isSignUp ? "Registrati per salvare progressi e giocare online." : "Accedi per continuare."
              : "Niente password! Ti mandiamo un link via email."}
          </Text>

          {/* Tab email / link magico */}
          <View style={[styles.tabRow, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={[styles.tab, mode === "email" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("email")}
            >
              <Text style={[styles.tabText, { color: mode === "email" ? "#fff" : colors.textSecondary }]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === "magic" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("magic")}
            >
              <Text style={[styles.tabText, { color: mode === "magic" ? "#fff" : colors.textSecondary }]}>
                ✨ Link magico
              </Text>
            </TouchableOpacity>
          </View>

          {/* Username — solo in registrazione */}
          {mode === "email" && isSignUp && (
            <View style={[styles.inputWrapper, { borderColor: colors.primary + "40", backgroundColor: colors.cardBackground }]}>
              <Ionicons name="at-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Scegli uno username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
          )}

          {/* Email */}
          <View style={[styles.inputWrapper, { borderColor: colors.primary + "40", backgroundColor: colors.cardBackground }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="La tua email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          {mode === "email" && (
            <View style={[styles.inputWrapper, { borderColor: colors.primary + "40", backgroundColor: colors.cardBackground }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password (min. 6 caratteri)"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottone principale */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={mode === "email" ? handleEmailAuth : handleMagicLink}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={mode === "magic" ? "paper-plane-outline" : isSignUp ? "person-add-outline" : "log-in-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.loginText}>
                  {mode === "magic" ? "Invia link magico" : isSignUp ? "Registrati" : "Accedi"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Toggle login/registrazione */}
          {mode === "email" && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => { setIsSignUp((v) => !v); setPassword(""); setUsername(""); }}
            >
              <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                {isSignUp ? "Hai già un account? " : "Nuovo qui? "}
                <Text style={{ color: colors.primary, fontWeight: "800" }}>
                  {isSignUp ? "Accedi" : "Registrati"}
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Magari più tardi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  content:        { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28, paddingBottom: 20 },
  iconContainer:  { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 18 },
  title:          { fontSize: 30, fontWeight: "900", marginBottom: 8, textAlign: "center" },
  subtitle:       { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 28 },
  tabRow:         { flexDirection: "row", borderRadius: 14, padding: 4, marginBottom: 20, width: "100%" },
  tab:            { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabText:        { fontSize: 14, fontWeight: "700" },
  inputWrapper:   { flexDirection: "row", alignItems: "center", gap: 10, width: "100%", borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12 },
  input:          { flex: 1, fontSize: 16 },
  loginButton:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", paddingVertical: 17, borderRadius: 18, marginTop: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
  loginText:      { color: "#fff", fontWeight: "800", fontSize: 17 },
  toggleButton:   { marginTop: 18, padding: 8 },
  toggleText:     { fontSize: 14 },
  backButton:     { marginTop: 14, padding: 10 },
  backText:       { fontSize: 15, fontWeight: "600" },
});