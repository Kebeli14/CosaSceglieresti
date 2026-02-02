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
    icon: "emoticon-happy", // icona sorridente per divertimento
    iconFamily: "material",
    color: "#facc15", // giallo solare
    gradient: ["#facc15", "#fbbf24"], // giallo sfumato
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
      
      

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Scegli una categoria e inizia a giocare
        </Text>
      </View>

      {/* Categories */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.8}
            onPress={() => handleCategoryPress(category)}
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
              <Ionicons
                name="chevron-forward"
                size={24}
                color="rgba(255,255,255,0.7)"
              />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Tocca una categoria per iniziare
        </Text>
      </View>
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
    paddingBottom: 20,
  },
  categoryButtonWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  categoryText: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
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
