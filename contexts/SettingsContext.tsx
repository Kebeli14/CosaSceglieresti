import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics"; 

type Theme = "light" | "dark" | "auto";
type Language = "it" | "en"; // Preparato per il futuro

interface SettingsContextType {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: Theme;
  language: Language; // Nuova proprietà
  toggleSound: () => void;
  toggleVibration: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void; // Nuova funzione
  playSound: (soundType: "click" | "whoosh" | "success") => Promise<void>;
  vibrate: (type?: "light" | "medium" | "heavy") => void;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    primary: string;
    storico: string;
    calcio: string;
    basket: string;
    religione: string;
    random: string;
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [theme, setThemeState] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("it"); // Default italiano

  // Carica le impostazioni all'avvio
  useEffect(() => {
    loadSettings();
  }, []);

  // Salva le impostazioni ogni volta che cambiano
  useEffect(() => {
    saveSettings();
  }, [soundEnabled, vibrationEnabled, theme, language]);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem("@app_settings");
      if (settings) {
        const parsed = JSON.parse(settings);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setVibrationEnabled(parsed.vibrationEnabled ?? true);
        setThemeState(parsed.theme ?? "light");
        setLanguageState(parsed.language ?? "it");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        "@app_settings",
        JSON.stringify({
          soundEnabled,
          vibrationEnabled,
          theme,
          language,
        })
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const toggleVibration = () => setVibrationEnabled(!vibrationEnabled);
  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const playSound = async (soundType: "click" | "whoosh" | "success") => {
    if (!soundEnabled) return;
    try {
      if (vibrationEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Error with feedback:", error);
    }
  };

  const vibrate = (type: "light" | "medium" | "heavy" = "light") => {
    if (!vibrationEnabled) return;
    try {
      switch (type) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.error("Error with haptic feedback:", error);
    }
  };

  const colors = {
    light: {
      background: "#F5F5F7",
      cardBackground: "#FFFFFF",
      text: "#1D1D1F",
      textSecondary: "#6E6E73",
      primary: "#007AFF",
      storico: "#1e3a8a",
      calcio: "#16a34a",
      basket: "#ea580c",
      religione: "#7c3aed",
      random: "#ec4899",
    },
    dark: {
      background: "#000000",
      cardBackground: "#1C1C1E",
      text: "#FFFFFF",
      textSecondary: "#8E8E93",
      primary: "#0A84FF",
      storico: "#3b82f6",
      calcio: "#22c55e",
      basket: "#f97316",
      religione: "#a855f7",
      random: "#f472b6",
    },
  };

  const currentColors = theme === "dark" ? colors.dark : colors.light;

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        vibrationEnabled,
        theme,
        language,
        toggleSound,
        toggleVibration,
        setTheme,
        setLanguage,
        playSound,
        vibrate,
        colors: currentColors,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}