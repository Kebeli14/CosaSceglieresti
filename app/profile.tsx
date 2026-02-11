import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const { colors, vibrate } = useSettings();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    if (vibrate) vibrate("medium");
    await signOut();
    router.replace("/"); 
  };

  const handleLogin = () => {
    if (vibrate) vibrate("light");
    router.push("/login"); 
  };

  const goToSettings = () => {
    if (vibrate) vibrate("light");
    router.push("/settings");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={[styles.standardTitle, { color: colors.text }]}>Profilo</Text>
        <TouchableOpacity 
          style={styles.headerSide} 
          onPress={goToSettings}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {user ? (
          <View style={styles.authSection}>
            <View style={[styles.avatarWrapper, { borderColor: colors.primary }]}>
              {user.user_metadata?.avatar_url ? (
                <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={60} color={colors.textSecondary} />
              )}
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.user_metadata?.full_name || "Utente"}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.cardBackground }]}>
                <Ionicons name="stats-chart" size={22} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.text }]}>Le mie statistiche</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.logoutButton, { marginTop: 40 }]} 
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={22} color="#ff4444" />
                <Text style={styles.logoutText}>Disconnetti</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.guestSection}>
            <View style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="lock-closed-outline" size={80} color={colors.textSecondary} />
            </View>
            <Text style={[styles.guestTitle, { color: colors.text }]}>Ops! Non sei loggato</Text>
            <Text style={[styles.guestSub, { color: colors.textSecondary }]}>
              Accedi per salvare i tuoi progressi e sfidare i tuoi amici.
            </Text>
            <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.primary }]} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Accedi / Registrati</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  headerSide: { width: 40, alignItems: 'center', justifyContent: 'center' },
  standardTitle: { fontSize: 22, fontWeight: "800", textAlign: 'center', flex: 1 },
  content: { paddingHorizontal: 25, alignItems: 'center', paddingTop: 20, paddingBottom: 40 },
  avatarWrapper: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 15 },
  avatar: { width: '100%', height: '100%' },
  userName: { fontSize: 24, fontWeight: '800' },
  userEmail: { fontSize: 14, marginTop: 5, marginBottom: 30 },
  menuContainer: { width: '100%', gap: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, gap: 15 },
  menuText: { fontSize: 16, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15 },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: '700' },
  guestSection: { alignItems: 'center', width: '100%', paddingTop: 40 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  guestTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  guestSub: { textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  loginButton: { width: '100%', padding: 18, borderRadius: 20, alignItems: 'center' },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  authSection: { width: '100%', alignItems: 'center' }
});