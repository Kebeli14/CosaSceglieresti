import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useSettings } from "./contexts/SettingsContext";
import { LinearGradient } from "expo-linear-gradient";

interface Category {
  id: string;
  name: string;
  icon: string;
  iconFamily: "material" | "fontawesome" | "ionicons";
  color: string;
  gradient: string[];
}

const categories: Category[] = [
  {
    id: "divertente",
    name: "Divertente",
    icon: "celebration",
    iconFamily: "material",
    color: "#facc15",
    gradient: ["#facc15", "#fbbf24"],
  },
  {
    id: "sport",
    name: "Sport",
    icon: "sports-soccer",
    iconFamily: "material",
    color: "#16a34a",
    gradient: ["#16a34a", "#22c55e"],
  },
  {
    id: "intrattenimento",
    name: "Intrattenimento",
    icon: "film", // icona film per cinema, serie, tv
    iconFamily: "fontawesome",
    color: "#f97316", // arancione brillante
    gradient: ["#f97316", "#fb923c"], // arancione sfumato
  },
  {
    id: "cultura generale",
    name: "Cultura Generale",
    icon: "account-balance",
    iconFamily: "material",
    color: "#1e3a8a",
    gradient: ["#1e3a8a", "#3b82f6"],
  },
  {
    id: "random",
    name: "Random",
    icon: "shuffle",
    iconFamily: "material",
    color: "#ec4899",
    gradient: ["#ec4899", "#f472b6"],
  },
  {
  id: "coming-soon",
  name: "Presto novità...",
  icon: "hourglass-empty",
  iconFamily: "material",
  color: "#6b7280",
  gradient: ["#6b7280", "#9ca3af"],
},

];

export default function Categories() {
  const router = useRouter();
  const { colors, vibrate } = useSettings();

  const handleCategoryPress = (category: Category) => {
    vibrate("light");
    router.push({
      pathname: "/game",
      params: { category: category.id },
    });
  };

  const handleSettingsPress = () => {
    vibrate("light");
    router.push("/settings");
  };

  const renderIcon = (category: Category) => {
    const iconProps = {
      size: 48,
      color: "#FFFFFF",
    };

    if (category.iconFamily === "material") {
      return <MaterialIcons name={category.icon as any} {...iconProps} />;
    } else if (category.iconFamily === "fontawesome") {
      return <FontAwesome5 name={category.icon as any} {...iconProps} />;
    } else {
      return <Ionicons name={category.icon as any} {...iconProps} />;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <RNStatusBar
        barStyle={colors.background === "#000000" ? "light-content" : "dark-content"}
      />
      
      {/* Header */}
<View style={styles.header}>
  {/* Freccia indietro */}
  <TouchableOpacity
    style={styles.headerLeft}
    onPress={() => router.back()}
    activeOpacity={0.7}
  >
    <Ionicons name="arrow-back" size={28} color={colors.text} />
  </TouchableOpacity>

  <Text style={[styles.title, { color: colors.text }]}>
    Cosa Sceglieresti?
  </Text>

  <TouchableOpacity
    style={styles.headerRight}
    onPress={handleSettingsPress}
    activeOpacity={0.7}
  >
    <Ionicons name="settings-outline" size={28} color={colors.text} />
  </TouchableOpacity>
</View>


      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Scegli una categoria e inizia a giocare
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
        styles.categoriesContainer,
        { flexGrow: 1 },
      ]}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <TouchableOpacity
          key={category.id}
            activeOpacity={0.8}
            disabled={category.id === "coming-soon"}
            onPress={() =>
          category.id !== "coming-soon" && handleCategoryPress(category)
      }
        style={styles.categoryButtonWrapper}
      >

            <LinearGradient
              colors={category.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryButton}
            >
              <View style={styles.iconContainer}>
                {renderIcon(category)}
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer vuoto, senza testo */}
      <View style={styles.footer} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    width: 40,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
  paddingHorizontal: 20,
  paddingBottom: 40,
  flexDirection: "row",
  flexWrap: "wrap",
},

  categoryButtonWrapper: {
  width: "50%",
  padding: 8,          // ⬅ spazio tra le card
},

  categoryButton: {
  aspectRatio: 0.9,    // ⬅ più basse
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
},

  iconContainer: {
   width: 70,
   height: 70,
   borderRadius: 35,
   backgroundColor: "rgba(255,255,255,0.25)",
   alignItems: "center",
   justifyContent: "center",
   marginBottom: 12,
  },
  categoryText: {
  fontSize: 15,
  fontWeight: "600",
  color: "#FFFFFF",
  textAlign: "center",
  opacity: 0.85,
},

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
  },
});
