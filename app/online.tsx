import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase"; // 👈 adatta il path

type Friend = {
  friend_id: string;
  username: string;
};

export default function Online() {
  const { colors, vibrate } = useSettings();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Modal ricerca
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string; username: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [alreadyFriend, setAlreadyFriend] = useState(false);

  // Carica lista amici
  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoadingFriends(true);
    const { data, error } = await supabase
      .from("friendships")
      .select("friend_id, profiles!friendships_friend_id_fkey(username)")
      .eq("user_id", user.id);

    if (!error && data) {
      setFriends(
        data.map((row: any) => ({
          friend_id: row.friend_id,
          username: row.profiles?.username ?? "Sconosciuto",
        }))
      );
    }
    setLoadingFriends(false);
  }, [user]);

  useEffect(() => {
    if (user) loadFriends();
  }, [user]);

  // Apri modal
  const openSearch = () => {
    if (!user) {
      Alert.alert(
        "Accesso richiesto",
        "Devi effettuare l'accesso per aggiungere amici.",
        [
          { text: "Annulla", style: "cancel" },
          { text: "Vai al Login", onPress: () => router.push("/login") },
        ]
      );
      return;
    }
    setSearchQuery("");
    setSearchResult(null);
    setAlreadyFriend(false);
    setSearchModalVisible(true);
    if (vibrate) vibrate("light");
  };

  // Cerca utente per username
  const searchUser = async () => {
    if (searchQuery.trim().length === 0) return;
    setSearching(true);
    setSearchResult(null);
    setAlreadyFriend(false);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", searchQuery.trim())
      .neq("id", user!.id) // escludi te stesso
      .single();

    if (error || !data) {
      setSearchResult(null);
    } else {
      setSearchResult(data);
      // Controlla se è già amico
      const already = friends.some((f) => f.friend_id === data.id);
      setAlreadyFriend(already);
    }
    setSearching(false);
  };

  // Aggiungi amico
  const addFriend = async () => {
    if (!searchResult || !user) return;
    setAdding(true);

    const { error } = await supabase.from("friendships").insert([
      { user_id: user.id, friend_id: searchResult.id },
      { user_id: searchResult.id, friend_id: user.id }, // amicizia bidirezionale
    ]);

    if (error) {
      Alert.alert("Errore", "Impossibile aggiungere l'amico. Riprova.");
    } else {
      setFriends((prev) => [...prev, { friend_id: searchResult.id, username: searchResult.username }]);
      setSearchModalVisible(false);
      if (vibrate) vibrate("medium");
    }
    setAdding(false);
  };

  // Rimuovi amico
  const removeFriend = (friendId: string, username: string) => {
    if (vibrate) vibrate("light");
    Alert.alert(
      "Rimuovi amico",
      `Vuoi rimuovere ${username} dalla tua lista amici?`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Rimuovi",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("friendships")
              .delete()
              .or(`and(user_id.eq.${user!.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user!.id})`);
            setFriends((prev) => prev.filter((f) => f.friend_id !== friendId));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={[styles.standardTitle, { color: colors.text }]}>Amici Online</Text>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={openSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="person-add-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Lista amici o stato vuoto */}
      {loadingFriends ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : friends.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {friends.length} {friends.length === 1 ? "amico" : "amici"}
          </Text>
          {friends.map((f) => (
            <View key={f.friend_id} style={[styles.friendRow, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.friendAvatar, { backgroundColor: colors.primary + "22" }]}>
                <Ionicons name="person" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.friendName, { color: colors.text }]}>{f.username}</Text>
              <TouchableOpacity
                onPress={() => removeFriend(f.friend_id, f.username)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addMoreBtn, { borderColor: colors.primary }]}
            onPress={openSearch}
          >
            <Ionicons name="person-add-outline" size={18} color={colors.primary} />
            <Text style={[styles.addMoreText, { color: colors.primary }]}>Aggiungi un amico</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
          <View style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
          </View>
          <Text style={[styles.text, { color: colors.text }]}>Nessun amico ancora</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Cerca un amico per username e aggiungilo alla tua lista per sfidarlo!
          </Text>
          <TouchableOpacity
            style={[styles.mainAddButton, { backgroundColor: colors.primary }]}
            onPress={openSearch}
          >
            <Text style={styles.mainAddButtonText}>Trova Amici</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── Modal ricerca amico ── */}
      <Modal
        visible={searchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Cerca un amico</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Inserisci l'username esatto del tuo amico
            </Text>

            {/* Input ricerca */}
            <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
              <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={searchQuery}
                onChangeText={(t) => { setSearchQuery(t); setSearchResult(null); }}
                placeholder="Es. mario99"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={searchUser}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResult(null); }}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: colors.primary, opacity: searchQuery.trim().length === 0 ? 0.5 : 1 }]}
              onPress={searchUser}
              disabled={searchQuery.trim().length === 0 || searching}
            >
              {searching
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.searchBtnText}>Cerca</Text>
              }
            </TouchableOpacity>

            {/* Risultato */}
            {!searching && searchQuery.length > 0 && searchResult === null && (
              <View style={[styles.resultBox, { backgroundColor: colors.background }]}>
                <Ionicons name="person-remove-outline" size={28} color={colors.textSecondary} />
                <Text style={[styles.resultNotFound, { color: colors.textSecondary }]}>
                  Nessun utente trovato
                </Text>
              </View>
            )}

            {searchResult && (
              <View style={[styles.resultBox, { backgroundColor: colors.background }]}>
                <View style={[styles.resultAvatar, { backgroundColor: colors.primary + "22" }]}>
                  <Ionicons name="person" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.resultName, { color: colors.text }]}>{searchResult.username}</Text>
                {alreadyFriend ? (
                  <View style={[styles.alreadyBadge, { backgroundColor: "#4ade8022" }]}>
                    <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                    <Text style={{ color: "#4ade80", fontWeight: "700", fontSize: 13 }}>Già amico</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={addFriend}
                    disabled={adding}
                  >
                    {adding
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.addBtnText}>Aggiungi</Text>
                    }
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.background }]}
              onPress={() => setSearchModalVisible(false)}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Annulla</Text>
            </TouchableOpacity>
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
  centered:        { flex: 1, justifyContent: "center", alignItems: "center" },

  // Lista amici
  listContent:     { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  sectionLabel:    { fontSize: 13, fontWeight: "600", marginBottom: 12, marginLeft: 4 },
  friendRow:       { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, marginBottom: 10, gap: 12 },
  friendAvatar:    { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  friendName:      { flex: 1, fontSize: 16, fontWeight: "700" },
  addMoreBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed" },
  addMoreText:     { fontWeight: "700", fontSize: 15 },

  // Stato vuoto
  center:          { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingBottom: 40 },
  iconCircle:      { width: 140, height: 140, borderRadius: 70, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  text:            { fontSize: 20, fontWeight: "700", textAlign: "center" },
  subText:         { marginTop: 10, fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 30 },
  mainAddButton:   { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  mainAddButtonText:{ color: "#fff", fontWeight: "800", fontSize: 16 },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet:      { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 44, gap: 14 },
  modalTitle:      { fontSize: 20, fontWeight: "800" },
  modalSub:        { fontSize: 14, marginTop: -8 },
  searchRow:       { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput:     { flex: 1, fontSize: 16 },
  searchBtn:       { padding: 14, borderRadius: 14, alignItems: "center" },
  searchBtnText:   { color: "#fff", fontWeight: "800", fontSize: 16 },
  resultBox:       { borderRadius: 16, padding: 16, alignItems: "center", gap: 10 },
  resultAvatar:    { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  resultName:      { fontSize: 18, fontWeight: "800" },
  resultNotFound:  { fontSize: 15, fontWeight: "600", textAlign: "center", marginTop: 4 },
  alreadyBadge:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtn:          { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 14 },
  addBtnText:      { color: "#fff", fontWeight: "800", fontSize: 15 },
  cancelBtn:       { padding: 14, borderRadius: 14, alignItems: "center" },
  cancelText:      { fontWeight: "700", fontSize: 15 },
});