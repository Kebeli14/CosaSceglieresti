import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Online() {
  const { colors, vibrate } = useSettings();
  const insets = useSafeAreaInsets();

  const handleAddFriend = () => {
    if (vibrate) vibrate("light");
    Alert.alert(
      "Aggiungi Amico", 
      "Inserisci lo username dell'amico che vuoi sfidare.",
      [{ text: "Annulla", style: "cancel" }, { text: "Cerca" }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={[styles.standardTitle, { color: colors.text }]}>Amici Online</Text>
        <TouchableOpacity 
          style={styles.headerSide} 
          onPress={handleAddFriend}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        ><Ionicons name="person-add-outline" size={24} color={colors.primary} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
        </View>
        <Text style={[styles.text, { color: colors.text }]}>Nessun amico online</Text>
        <Text style={[styles.subText, { color: colors.textSecondary }]}>Aggiungi i tuoi amici usando il tasto in alto a destra per iniziare a sfidarli!</Text>
        <TouchableOpacity 
          style={[styles.mainAddButton, { backgroundColor: colors.primary }]}
          onPress={handleAddFriend}
        ><Text style={styles.mainAddButtonText}>Trova Amici</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  headerSide: { width: 40, alignItems: 'center', justifyContent: 'center' },
  standardTitle: { fontSize: 22, fontWeight: "800", textAlign: 'center', flex: 1 },
  center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 40 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  text: { fontSize: 20, fontWeight: "700", textAlign: 'center' },
  subText: { marginTop: 10, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  mainAddButton: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 },
  mainAddButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});