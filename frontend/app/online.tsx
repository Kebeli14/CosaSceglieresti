import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "./contexts/SettingsContext";
// 1. Importa l'hook per lo spazio sicuro
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Online() {
  const { colors } = useSettings();
  const insets = useSafeAreaInsets(); // 2. Ottieni i margini della fotocamera

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          // 3. Applica il padding superiore dinamico
          paddingTop: insets.top 
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Amici Online</Text>
      </View>

      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
        </View>
        
        <Text style={[styles.text, { color: colors.text }]}>
          Nessun amico online
        </Text>
        <Text style={[styles.subText, { color: colors.textSecondary }]}>
          Quando i tuoi amici saranno connessi, li vedrai apparire qui per sfidarli!
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)' // Una sottile linea di divisione
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "800" 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40, // Più margine ai lati per il testo
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // Ombra leggera
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  text: { 
    fontSize: 20, 
    fontWeight: "700",
    textAlign: 'center'
  },
  subText: { 
    marginTop: 10, 
    fontSize: 15, 
    textAlign: 'center',
    lineHeight: 22
  }
});