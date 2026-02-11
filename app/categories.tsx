import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext"; 
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
  icon: string;
  iconFamily: "material" | "fontawesome" | "ionicons";
  color: string;
  gradient: [string, string, ...string[]]; // Definito come array di almeno due stringhe
}

const categories: Category[] = [
  { id: "divertente", name: "Divertente", icon: "celebration", iconFamily: "material", color: "#facc15", gradient: ["#facc15", "#fbbf24"] },
  { id: "sport", name: "Sport", icon: "sports-soccer", iconFamily: "material", color: "#16a34a", gradient: ["#16a34a", "#22c55e"] },
  { id: "intrattenimento", name: "Intrattenimento", icon: "film", iconFamily: "fontawesome", color: "#f97316", gradient: ["#f97316", "#fb923c"] },
  { id: "cultura generale", name: "Cultura Generale", icon: "account-balance", iconFamily: "material", color: "#1e3a8a", gradient: ["#1e3a8a", "#3b82f6"] },
  { id: "random", name: "Random", icon: "shuffle", iconFamily: "material", color: "#ec4899", gradient: ["#ec4899", "#f472b6"] },
  { id: "coming-soon", name: "Presto novità...", icon: "hourglass-empty", iconFamily: "material", color: "#6b7280", gradient: ["#6b7280", "#9ca3af"] },
];

export default function Categories() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Usiamo "any" qui per evitare che TypeScript blocchi il build se le chiavi non coincidono perfettamente
  const { colors, vibrate }: any = useSettings();

  // Gestione colori ultra-sicura
  const bgColor = colors?.background || "#FFFFFF";
  const textColor = colors?.text || "#000000";
  
  // Soluzione per l'errore secondary: fallback manuale
  const textSecondaryColor = colors?.textSecondary || colors?.secondary || "#666666";

  const handleCategoryPress = (category: Category) => {
    if (vibrate) vibrate("light");
    router.push({ pathname: "/game", params: { category: category.id } });
  };

  const renderIcon = (category: Category) => {
    const iconProps = { size: 40, color: "#FFFFFF" };
    if (category.iconFamily === "material") return <MaterialIcons name={category.icon as any} {...iconProps} />;
    if (category.iconFamily === "fontawesome") return <FontAwesome5 name={category.icon as any} {...iconProps} />;
    return <Ionicons name={category.icon as any} {...iconProps} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.standardTitle, { color: textColor }]}>Categorie</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.subtitleContainer}>
          <Text style={[styles.subtitle, { color: textSecondaryColor }]}>
            Scegli una categoria e inizia a giocare
          </Text>
        </View>

        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.8}
              disabled={category.id === "coming-soon"}
              onPress={() => handleCategoryPress(category)}
              style={styles.categoryCardWrapper}
            >
              <LinearGradient 
                // Forza il tipo string[] per evitare errori nel gradiente
                colors={category.gradient as [string, string, ...string[]]} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.categoryCard}
              >
                <View style={styles.iconCircle}>{renderIcon(category)}</View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    height: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  headerSide: { width: 40, alignItems: 'center', justifyContent: 'center' },
  standardTitle: { fontSize: 24, fontWeight: "900", textAlign: 'center', flex: 1, letterSpacing: -0.5 },
  scrollContent: { paddingBottom: 40 },
  subtitleContainer: { paddingHorizontal: 40, marginVertical: 20 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22, fontWeight: "500" },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  categoryCardWrapper: { width: '50%', padding: 10 },
  categoryCard: { 
    aspectRatio: 1, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 15,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  iconCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 10 
  },
  categoryName: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' }
});