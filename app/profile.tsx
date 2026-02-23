import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Configurazione livelli ───────────────────────────────────────────────────
const LEVELS = [
  { level: 1, label: "Novizio",  xpRequired: 0    },
  { level: 2, label: "Curioso",  xpRequired: 100  },
  { level: 3, label: "Esperto",  xpRequired: 300  },
  { level: 4, label: "Veterano", xpRequired: 600  },
  { level: 5, label: "Leggenda", xpRequired: 1000 },
];

function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next: typeof LEVELS[0] | null = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const xpIntoLevel = next ? xp - current.xpRequired : 0;
  const xpNeeded    = next ? next.xpRequired - current.xpRequired : 1;
  const progress    = next ? xpIntoLevel / xpNeeded : 1;
  return { current, next, xpIntoLevel, xpNeeded, progress };
}

// ─── Configurazione badge ─────────────────────────────────────────────────────
type Badge = {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
  unlocked: boolean;
};

function getBadges(xp: number, streak: number, questions: number): Badge[] {
  return [
    {
      id: "first_answer",
      icon: "chatbubble-ellipses",
      label: "Prima risposta",
      description: "Hai risposto alla tua prima domanda",
      color: "#4cc9f0",
      unlocked: questions >= 1,
    },
    {
      id: "q10",
      icon: "flash",
      label: "10 domande",
      description: "Hai risposto a 10 domande",
      color: "#f8961e",
      unlocked: questions >= 10,
    },
    {
      id: "q50",
      icon: "rocket",
      label: "50 domande",
      description: "Hai risposto a 50 domande",
      color: "#9b5de5",
      unlocked: questions >= 50,
    },
    {
      id: "streak3",
      icon: "flame",
      label: "3 giorni di fila",
      description: "Streak di 3 giorni consecutivi",
      color: "#ff6b35",
      unlocked: streak >= 3,
    },
    {
      id: "streak7",
      icon: "bonfire",
      label: "Una settimana",
      description: "Streak di 7 giorni consecutivi",
      color: "#ef233c",
      unlocked: streak >= 7,
    },
    {
      id: "legend",
      icon: "trophy",
      label: "Leggenda",
      description: "Hai raggiunto il livello massimo",
      color: "#ffd60a",
      unlocked: xp >= 1000,
    },
  ];
}

function formatJoinDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

// ─── Barra XP ─────────────────────────────────────────────────────────────────
function XPBar({ xp, colors }: { xp: number; colors: any }) {
  const { current, next, xpIntoLevel, xpNeeded, progress } = getLevelInfo(xp);
  return (
    <View style={[xpStyles.container, { backgroundColor: colors.cardBackground }]}>
      <View style={xpStyles.topRow}>
        <View style={xpStyles.levelBadge}>
          <Text style={xpStyles.levelNumber}>LV {current.level}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={xpStyles.labelRow}>
            <Text style={[xpStyles.levelLabel, { color: colors.text }]}>{current.label}</Text>
            {next && (
              <Text style={[xpStyles.xpText, { color: colors.textSecondary }]}>
                {xpIntoLevel} / {xpNeeded} XP
              </Text>
            )}
          </View>
          <View style={[xpStyles.barBg, { backgroundColor: colors.background }]}>
            <View style={[xpStyles.barFill, { width: `${Math.min(progress * 100, 100)}%` as any }]} />
          </View>
          {next && (
            <Text style={[xpStyles.nextLabel, { color: colors.textSecondary }]}>
              Prossimo: {next.label}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const xpStyles = StyleSheet.create({
  container:   { width: "100%", borderRadius: 18, padding: 16, marginBottom: 14 },
  topRow:      { flexDirection: "row", alignItems: "center" },
  levelBadge:  { width: 52, height: 52, borderRadius: 16, backgroundColor: "#7c3aed", justifyContent: "center", alignItems: "center" },
  levelNumber: { color: "#fff", fontWeight: "800", fontSize: 16 },
  labelRow:    { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  levelLabel:  { fontWeight: "700", fontSize: 15 },
  xpText:      { fontSize: 12 },
  barBg:       { height: 10, borderRadius: 10, overflow: "hidden" },
  barFill:     { height: "100%", borderRadius: 10, backgroundColor: "#7c3aed" },
  nextLabel:   { fontSize: 11, marginTop: 5 },
});

// ─── Griglia badge ────────────────────────────────────────────────────────────
function BadgeGrid({ badges, colors }: { badges: Badge[]; colors: any }) {
  const [selected, setSelected] = useState<Badge | null>(null);
  return (
    <View style={[badgeStyles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[badgeStyles.title, { color: colors.text }]}>🏅 Obiettivi</Text>
      <View style={badgeStyles.grid}>
        {badges.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[badgeStyles.item, { backgroundColor: colors.background, opacity: b.unlocked ? 1 : 0.35 }]}
            onPress={() => setSelected(b)}
            activeOpacity={0.7}
          >
            <View style={[badgeStyles.iconCircle, { backgroundColor: b.unlocked ? b.color + "22" : "#33333322" }]}>
              <Ionicons name={b.icon as any} size={26} color={b.unlocked ? b.color : "#888"} />
            </View>
            <Text style={[badgeStyles.label, { color: b.unlocked ? colors.text : colors.textSecondary }]}>
              {b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={badgeStyles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={[badgeStyles.tooltip, { backgroundColor: colors.cardBackground }]}>
            {selected && (
              <>
                <View style={[badgeStyles.tooltipIcon, { backgroundColor: selected.color + "22" }]}>
                  <Ionicons name={selected.icon as any} size={40} color={selected.unlocked ? selected.color : "#888"} />
                </View>
                <Text style={[badgeStyles.tooltipTitle, { color: colors.text }]}>{selected.label}</Text>
                <Text style={[badgeStyles.tooltipDesc, { color: colors.textSecondary }]}>{selected.description}</Text>
                <Text style={[badgeStyles.tooltipStatus, { color: selected.unlocked ? "#4ade80" : "#888" }]}>
                  {selected.unlocked ? "✓ Sbloccato" : "🔒 Non ancora sbloccato"}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container:    { width: "100%", borderRadius: 18, padding: 16, marginBottom: 14 },
  title:        { fontWeight: "800", fontSize: 16, marginBottom: 14 },
  grid:         { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  item:         { width: "30%", borderRadius: 14, padding: 10, alignItems: "center", gap: 6 },
  iconCircle:   { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  label:        { fontSize: 11, fontWeight: "600", textAlign: "center" },
  overlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  tooltip:      { width: "100%", borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  tooltipIcon:  { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  tooltipTitle: { fontSize: 18, fontWeight: "800" },
  tooltipDesc:  { fontSize: 14, textAlign: "center", lineHeight: 20 },
  tooltipStatus:{ fontSize: 13, fontWeight: "700", marginTop: 4 },
});

// ─── Schermata principale ─────────────────────────────────────────────────────
export default function Profile() {
  const { colors, vibrate } = useSettings();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 👇 Hardcodato per ora — sostituisci con dati reali da Supabase in futuro
  const xp        = 120;
  const streak    = 4;
  const questions = 15;

  const badges = getBadges(xp, streak, questions);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");

  // Carica il nome salvato all'avvio
  useEffect(() => {
    const loadName = async () => {
      const saved = await AsyncStorage.getItem("display_name");
      if (saved) {
        setDisplayName(saved);
        setNewName(saved);
      } else {
        const fallback = user?.user_metadata?.full_name ?? "Utente";
        setDisplayName(fallback);
        setNewName(fallback);
      }
    };
    loadName();
  }, []);

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

  const openEditName = () => {
    if (vibrate) vibrate("light");
    setEditModalVisible(true);
  };

  const saveName = async () => {
    if (newName.trim().length === 0) return;
    const trimmed = newName.trim();
    setDisplayName(trimmed);
    await AsyncStorage.setItem("display_name", trimmed);
    setEditModalVisible(false);
    // Per persistere su Supabase: supabase.auth.updateUser({ data: { full_name: trimmed } })
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={openEditName}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil-outline" size={24} color={colors.text} />
        </TouchableOpacity>
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

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarWrapper, { borderColor: colors.primary }]}>
                {user.user_metadata?.avatar_url ? (
                  <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
                ) : (
                  <Ionicons name="person" size={60} color={colors.textSecondary} />
                )}
              </View>
            </View>

            {/* Nome, email, data iscrizione */}
            <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
            {user.created_at && (
              <View style={styles.joinRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.joinText, { color: colors.textSecondary }]}>
                  Iscritto da {formatJoinDate(user.created_at)}
                </Text>
              </View>
            )}

            {/* XP + Badge */}
            <View style={styles.sections}>
              <XPBar xp={xp} colors={colors} />
              <BadgeGrid badges={badges} colors={colors} />
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#ff4444" />
              <Text style={styles.logoutText}>Disconnetti</Text>
            </TouchableOpacity>

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

      {/* Modal modifica nome */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Modifica nome</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Il tuo nome"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModalVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSave, { backgroundColor: colors.primary }]} onPress={saveName}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { height: 60, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  headerSide:      { width: 40, alignItems: "center", justifyContent: "center" },
  standardTitle:   { fontSize: 22, fontWeight: "800", textAlign: "center", flex: 1 },
  content:         { paddingHorizontal: 25, alignItems: "center", paddingTop: 20, paddingBottom: 40 },
  avatarContainer: { marginBottom: 15 },
  avatarWrapper:   { width: 120, height: 120, borderRadius: 60, borderWidth: 3, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatar:          { width: "100%", height: "100%" },
  userName:        { fontSize: 24, fontWeight: "800" },
  userEmail:       { fontSize: 14, marginTop: 5 },
  joinRow:         { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  joinText:        { fontSize: 12 },
  sections:        { width: "100%", marginTop: 24 },
  logoutButton:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 15, marginTop: 10 },
  logoutText:      { color: "#ff4444", fontSize: 16, fontWeight: "700" },
  guestSection:    { alignItems: "center", width: "100%", paddingTop: 40 },
  iconCircle:      { width: 140, height: 140, borderRadius: 70, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  guestTitle:      { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  guestSub:        { textAlign: "center", lineHeight: 22, marginBottom: 30 },
  loginButton:     { width: "100%", padding: 18, borderRadius: 20, alignItems: "center" },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  authSection:     { width: "100%", alignItems: "center" },
  modalOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  modalBox:        { width: "100%", borderRadius: 20, padding: 24 },
  modalTitle:      { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  input:           { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 20 },
  modalButtons:    { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalCancel:     { paddingHorizontal: 16, paddingVertical: 10 },
  modalSave:       { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
});