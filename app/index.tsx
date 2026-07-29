import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useSettings } from "../contexts/SettingsContext";
import { useUser } from "../contexts/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
  icon: string;
  iconFamily: "material" | "fontawesome";
  gradient: [string, string, ...string[]];
}

const categories: Category[] = [
  { id: "divertente", name: "Divertente", icon: "celebration", iconFamily: "material", gradient: ["#facc15", "#fbbf24"] },
  { id: "sport", name: "Sport", icon: "sports-soccer", iconFamily: "material", gradient: ["#16a34a", "#22c55e"] },
  { id: "intrattenimento", name: "Intrattenimento", icon: "film", iconFamily: "fontawesome", gradient: ["#f97316", "#fb923c"] },
  { id: "cultura generale", name: "Cultura Generale", icon: "account-balance", iconFamily: "material", gradient: ["#1e3a8a", "#3b82f6"] },
];

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, vibrate } = useSettings();
  const { bestStreak } = useUser();

  const goToCategory = (id: string) => {
    if (vibrate) vibrate("light");
    router.push({ pathname: "/game", params: { category: id } });
  };

  const goToPopular = () => {
    if (vibrate) vibrate("light");
    router.push("/popular");
  };

  const renderCategoryIcon = (category: Category) => {
    const iconProps = { size: 28, color: "#fff" };
    if (category.iconFamily === "material") return <MaterialIcons name={category.icon as any} {...iconProps} />;
    return <FontAwesome5 name={category.icon as any} {...iconProps} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>

      {/* LOGO */}
      <LinearGradient
        colors={["#CDEAF8", "#E4D6F2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.brand}
      >
        <Text style={styles.brandTitle}>
          <Text style={styles.brandTitleRed}>Cosa</Text>
          <Text style={styles.brandTitleBlue}> Sceglieresti</Text>
          <Text style={styles.brandTitleRed}>?</Text>
        </Text>
      </LinearGradient>

      <View style={styles.content}>

        {/* SEZIONE CATEGORIE */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Categorie</Text>
        <View style={styles.grid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.85}
              onPress={() => goToCategory(category.id)}
              style={styles.tileWrapper}
            >
              <LinearGradient
                colors={category.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tile}
              >
                <View style={styles.tileIconCircle}>{renderCategoryIcon(category)}</View>
                <Text style={styles.tileName}>{category.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* RANDOM - a tutta larghezza, chiude la sezione categorie */}
        <TouchableOpacity style={styles.randomWrapper} activeOpacity={0.85} onPress={() => goToCategory("random")}>
          <LinearGradient colors={["#ec4899", "#f472b6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.randomTile}>
            <View style={styles.tileIconCircleSmall}>
              <MaterialIcons name="shuffle" size={22} color="#fff" />
            </View>
            <Text style={[styles.tileName, { marginLeft: 14 }]}>Random</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* SEZIONE MODALITÀ */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>Un altro stile di gioco</Text>
        <TouchableOpacity style={styles.popularWrapper} activeOpacity={0.85} onPress={goToPopular}>
          <LinearGradient colors={["#764ba2", "#5b2a86"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.popularCard}>
            <View style={styles.popularTopRow}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MODALITÀ</Text>
              </View>
              {bestStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={13} color="#FFD700" />
                  <Text style={styles.streakBadgeText}>Record: {bestStreak}</Text>
                </View>
              )}
            </View>
            <View style={styles.popularRow}>
              <View style={styles.tileIconCircleSmall}>
                <Ionicons name="flame" size={24} color="#fff" />
              </View>
              <View style={styles.popularTextWrap}>
                <Text style={styles.modeTitle}>Popolari</Text>
                <Text style={styles.modeSubtitle}>Indovina cosa preferisce la maggioranza</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.75)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  brand: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  brandTitleRed: {
    color: "#E63950",
    textShadowColor: "rgba(230,57,80,0.25)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  brandTitleBlue: {
    color: "#1667A0",
    textShadowColor: "rgba(22,103,160,0.25)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 14,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 8,
    marginBottom: 8,
  },

  grid: {
    flex: 3,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  tileWrapper: {
    width: "50%",
    height: "50%",
    padding: 6,
  },

  tile: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  randomWrapper: {
    flex: 1,
    paddingVertical: 6,
  },

  randomTile: {
    flex: 1,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  tileIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  tileIconCircleSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  tileName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  popularWrapper: {
    flex: 1.6,
  },

  popularCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  popularTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  popularBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  popularBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  streakBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  popularRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  popularTextWrap: {
    flex: 1,
  },

  modeTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  modeSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 3,
    fontSize: 12,
    fontWeight: "500",
  },
});
