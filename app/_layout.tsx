import { Tabs } from "expo-router";
import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import { AuthProvider } from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
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

function LayoutContent() {
  const { colors }: any = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors?.primary || "#3b82f6",
        tabBarInactiveTintColor: colors?.textSecondary || "#666",
        tabBarStyle: {
          backgroundColor: colors?.cardBackground || "#fff",
          height: 75,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors?.border || "#eee",
        },
        tabBarItemStyle: {
          flex: 1, // 👈 distribuisce spazio UGUALE
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* CLASSIFICA */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Classifica",
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy" size={24} color={color} />
          ),
        }}
      />

      {/* PROFILO */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profilo",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* SCHERMATE NASCOSTE */}
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="friend" options={{ href: null }} />
      <Tabs.Screen name="popular" options={{ href: null }} />
      <Tabs.Screen name="game" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="daily-dilemma" options={{ href: null }} />
    </Tabs>
  );
}