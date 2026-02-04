import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Leaderboard() {
  const { colors } = useSettings();
  const insets = useSafeAreaInsets();

  // Dati finti
  const topPlayers = [
    { id: 1, name: "Ivan", points: "2540", rank: 1, color: "#FFD700" },
    { id: 2, name: "David", points: "2100", rank: 2, color: "#C0C0C0" },
    { id: 3, name: "Austin", points: "1850", rank: 3, color: "#CD7F32" },
  ];

  const otherPlayers = [
    { id: 4, name: "Sofia", points: "1500" },
    { id: 5, name: "Luca", points: "1420" },
    { id: 6, name: "Marco", points: "1380" },
    { id: 7, name: "Giulia", points: "1200" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* HEADER STANDARDIZZATO */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={[styles.standardTitle, { color: colors.text }]}>Classifica</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* PODIO */}
        <View style={styles.podiumContainer}>
          
          {/* 2° POSTO */}
          <View style={[styles.podiumItem, { marginTop: 40 }]}>
            <View style={[styles.avatarCircle, { borderColor: topPlayers[1].color, backgroundColor: colors.cardBackground }]}>
              <Ionicons name="person" size={40} color={colors.textSecondary} />
              <View style={[styles.badge, { backgroundColor: topPlayers[1].color }]}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { color: colors.text }]}>{topPlayers[1].name}</Text>
            <Text style={[styles.podiumPoints, { color: colors.primary }]}>{topPlayers[1].points} pt</Text>
          </View>

          {/* 1° POSTO */}
          <View style={styles.podiumItem}>
            <Ionicons name="ribbon" size={30} color={topPlayers[0].color} style={styles.crownIcon} />
            <View style={[styles.avatarCircle, { borderColor: topPlayers[0].color, width: 100, height: 100, borderRadius: 50, backgroundColor: colors.cardBackground }]}>
              <Ionicons name="person" size={60} color={colors.textSecondary} />
              <View style={[styles.badge, { backgroundColor: topPlayers[0].color, bottom: -5, width: 28, height: 28, borderRadius: 14 }]}>
                <Text style={[styles.badgeText, { fontSize: 16 }]}>1</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { color: colors.text, fontSize: 18, marginTop: 10 }]}>{topPlayers[0].name}</Text>
            <Text style={[styles.podiumPoints, { color: colors.primary, fontSize: 16 }]}>{topPlayers[0].points} pt</Text>
          </View>

          {/* 3° POSTO */}
          <View style={[styles.podiumItem, { marginTop: 50 }]}>
            <View style={[styles.avatarCircle, { borderColor: topPlayers[2].color, width: 70, height: 70, borderRadius: 35, backgroundColor: colors.cardBackground }]}>
              <Ionicons name="person" size={35} color={colors.textSecondary} />
              <View style={[styles.badge, { backgroundColor: topPlayers[2].color }]}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { color: colors.text }]}>{topPlayers[2].name}</Text>
            <Text style={[styles.podiumPoints, { color: colors.primary }]}>{topPlayers[2].points} pt</Text>
          </View>
        </View>

        {/* LISTA ALTRE POSIZIONI */}
        <View style={[styles.listContainer, { backgroundColor: colors.cardBackground }]}>
          {otherPlayers.map((player) => (
            <View key={player.id} style={[styles.playerRow, { borderBottomColor: colors.background }]}>
              <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>{player.id}</Text>
              <View style={[styles.smallAvatar, { backgroundColor: colors.background }]}>
                <Ionicons name="person" size={18} color={colors.textSecondary} />
              </View>
              <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
              <Text style={[styles.playerPoints, { color: colors.primary }]}>{player.points} pt</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Stili Header Standard (IDENTICI AGLI ALTRI)
  header: { 
    height: 60,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
  },
  headerSide: { 
    width: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  standardTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    textAlign: 'center',
    flex: 1 
  },
  // Fine Stili Header
  podiumContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    paddingHorizontal: 10,
    marginVertical: 30 
  },
  podiumItem: { alignItems: 'center', flex: 1 },
  avatarCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 4, 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative'
  },
  badge: { 
    position: 'absolute', 
    bottom: -2, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  crownIcon: { marginBottom: -5, zIndex: 1 },
  podiumName: { fontWeight: '800', marginTop: 5 },
  podiumPoints: { fontWeight: '600', fontSize: 14 },
  listContainer: { 
    marginHorizontal: 20, 
    borderRadius: 24, 
    paddingVertical: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 }
    })
  },
  playerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15, 
    paddingHorizontal: 20,
    borderBottomWidth: 1 
  },
  rankNumber: { width: 30, fontSize: 16, fontWeight: '700' },
  smallAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  playerName: { flex: 1, fontSize: 16, fontWeight: '600' },
  playerPoints: { fontWeight: '800' }
});