import { Tabs } from "expo-router";
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import { AuthProvider } from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

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
  // Usiamo "any" per evitare errori di compilazione sulle proprietà di colors
  const { colors }: any = useSettings();

  useEffect(() => {
    const handleUrl = async (url: string) => {
      const getParam = (name: string) => {
        const regex = new RegExp(`[#?&]${name}=([^&]*)`);
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      const access_token = getParam("access_token");
      const refresh_token = getParam("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        
        if (error) {
          console.error("Errore sessione Supabase:", error.message);
        } else {
          console.log("Login completato con successo!");
        }
      }
    };

    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors?.primary || "#3b82f6",
        tabBarInactiveTintColor: colors?.textSecondary || colors?.secondary || "#666",
        tabBarStyle: {
          // Fallback se cardBackground non esiste
          backgroundColor: colors?.cardBackground || colors?.background || "#fff",
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopWidth: 1,
          // Fallback se border non esiste
          borderTopColor: colors?.border || "#eeeeee",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} /> }} />
      <Tabs.Screen name="online" options={{ title: "Online", tabBarIcon: ({ color }) => <Ionicons name="earth" size={26} color={color} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Classifica", tabBarIcon: ({ color }) => <Ionicons name="trophy" size={26} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profilo", tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} /> }} />

      {/* Esclusioni */}
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="friend" options={{ href: null }} />
      <Tabs.Screen name="popular" options={{ href: null }} />
      <Tabs.Screen name="game" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="whoareu" options={{ href: null }} />
      <Tabs.Screen name="daily-dilemma" options={{ href: null }} />
      <Tabs.Screen name="contexts/AuthContext" options={{ href: null }} />
      <Tabs.Screen name="contexts/SettingsContext" options={{ href: null }} />
      <Tabs.Screen name="lib/supabase" options={{ href: null }} />
    </Tabs>
  );
}