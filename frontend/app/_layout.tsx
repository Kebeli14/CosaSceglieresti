import { Tabs } from "expo-router";
import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import { AuthProvider } from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
// AGGIUNGI QUESTO IMPORT
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    // Avvolgi tutto con SafeAreaProvider
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <LayoutContent />
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

// ... il resto del tuo LayoutContent rimane uguale

function LayoutContent() {
  const { colors } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: colors?.textSecondary || "#666",
        tabBarStyle: {
          backgroundColor: colors?.cardBackground || "#fff",
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors?.border || "#eee",
        },
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* 2. ONLINE */}
      <Tabs.Screen
        name="online"
        options={{
          title: "Online",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "earth" : "earth-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* 3. CLASSIFICA */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Classifica",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* 4. PROFILO */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profilo",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* --- NASCONDI TUTTO IL RESTO --- */}
      {/* Usiamo un array di nomi e mappiamo per pulizia, 
          o semplicemente elenchiamo quelli che Expo Router "vede" erroneamente */}
      
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="friend" options={{ href: null }} />
      <Tabs.Screen name="popular" options={{ href: null }} />
      <Tabs.Screen name="game" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="whoareu" options={{ href: null }} />
      <Tabs.Screen name="daily-dilemma" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
    
      
      {/* ATTENZIONE: Questo deve corrispondere al percorso che vedi scritto nella tab! */}
      <Tabs.Screen name="contexts/AuthContext" options={{ href: null }} />
      <Tabs.Screen name="contexts/SettingsContext" options={{ href: null }} />

    </Tabs>
  );
}