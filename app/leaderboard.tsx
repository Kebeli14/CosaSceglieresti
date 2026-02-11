import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* SFONDO DECORATIVO */}
      <LinearGradient 
        colors={[colors.primary + '15', 'transparent']} 
        style={styles.bgGradient} 
      />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerSide} />
        <Text style={[styles.standardTitle, { color: colors.text }]}>Classifica</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* PODIO FISICO */}
        <View style={styles.podiumWrapper}>
          
          {/* 2° POSTO */}
          <View style={styles.podiumColumn}>
            <View style={[styles.avatarCircle, { borderColor: topPlayers[1].color, backgroundColor: colors.cardBackground }]}>
              <Ionicons name="person" size={35} color={colors.textSecondary} />
              <View style={[styles.badge, { backgroundColor: topPlayers[1].color }]}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>{topPlayers[1].name}</Text>
            <LinearGradient colors={[topPlayers[1].color, topPlayers[1].color + '50']} style={[styles.podiumBar, { height: 80 }]}>
              <Text style={styles.barPoints}>{topPlayers[1].points}</Text>
            </LinearGradient>
          </View>

          {/* 1° POSTO */}
          <View style={styles.podiumColumn}>
            <Ionicons name="ribbon" size={30} color={topPlayers[0].color} style={styles.crownIcon} />
            <View style={[styles.avatarCircle, { borderColor: topPlayers[0].color, width: 90, height: 90, borderRadius: 45, backgroundColor: colors.cardBackground }]}>
              <Ionicons name="person" size={50} color={colors.textSecondary} />
              <View style={[styles.badge, { backgroundColor: topPlayers[0].color, width: 26, height: 26, borderRadius: 13 }]}>
                <Text style={[styles.badgeText, { fontSize: 14 }]}>1</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { color: colors.text, fontSize: 16, fontWeight: '900' }]} numberOfLines={1}>{topPlayers[0].name}</Text>
            <LinearGradient colors={[topPlayers[0].color, topPlayers[0].color + '50']} style={[styles.podiumBar, { height: 120 }]}>
               <Text style={styles.barPoints}>{topPlayers[0].points}</Text>
            </LinearGradient>
          </View>

          {/* 3° POSTO */}
          <View style={styles.podiumColumn}>
            <View style={[styles.avatarCircle, { borderColor: topPlayers[2].color, width: 65, height: 65, borderRadius: 32.5, backgroundColor: colors.cardBackground }]}>
              <Ionicons name="person" size={30} color={colors.textSecondary} />
              <View style={[styles.badge, { backgroundColor: topPlayers[2].color }]}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>{topPlayers[2].name}</Text>
            <LinearGradient colors={[topPlayers[2].color, topPlayers[2].color + '50']} style={[styles.podiumBar, { height: 60 }]}>
               <Text style={styles.barPoints}>{topPlayers[2].points}</Text>
            </LinearGradient>
          </View>

        </View>

        {/* LISTA ALTRE POSIZIONI */}
        <View style={[styles.listContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.listHeader, {color: colors.textSecondary}]}>TOP 10 SETTIMANALE</Text>
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
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 400 },
  header: { 
    height: 100,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    zIndex: 10
  },
  headerSide: { width: 40 },
  standardTitle: { fontSize: 24, fontWeight: "900", textAlign: 'center', flex: 1, letterSpacing: 1 },
  
  // PODIO FISICO
  podiumWrapper: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    paddingHorizontal: 15,
    marginTop: 20,
    height: 300,
  },
  podiumColumn: { flex: 1, alignItems: 'center' },
  podiumBar: { 
    width: '85%', 
    borderTopLeftRadius: 12, 
    borderTopRightRadius: 12, 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10
  },
  barPoints: { color: '#fff', fontWeight: '900', fontSize: 12, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 3, textShadowOffset: {width: 1, height: 1} },
  
  avatarCircle: { 
    width: 75, 
    height: 75, 
    borderRadius: 37.5, 
    borderWidth: 3, 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
    zIndex: 2
  },
  badge: { 
    position: 'absolute', 
    bottom: -2, 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  crownIcon: { marginBottom: -10, zIndex: 5 },
  podiumName: { fontWeight: '800', marginTop: 8, fontSize: 14, width: '90%', textAlign: 'center' },

  // LISTA
  listContainer: { 
    marginHorizontal: 20, 
    marginTop: 20,
    borderRadius: 30, 
    paddingVertical: 15,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 8 }
    })
  },
  listHeader: { fontSize: 12, fontWeight: '900', textAlign: 'center', marginBottom: 10, letterSpacing: 1, opacity: 0.6 },
  playerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15, 
    paddingHorizontal: 20,
    borderBottomWidth: 1 
  },
  rankNumber: { width: 30, fontSize: 16, fontWeight: '900' },
  smallAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  playerName: { flex: 1, fontSize: 16, fontWeight: '700' },
  playerPoints: { fontWeight: '900', fontSize: 15 }
});