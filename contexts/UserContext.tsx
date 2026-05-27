import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

const ADJECTIVES = [
  "Veloce", "Furioso", "Saggio", "Coraggioso", "Misterioso", "Audace",
  "Brillante", "Astuto", "Feroce", "Leggendario", "Potente", "Silenzioso",
  "Antico", "Oscuro", "Luminoso", "Selvatico", "Nobile", "Imbattibile",
];
const ANIMALS = [
  "Panda", "Tigre", "Falco", "Lupo", "Orso", "Leone", "Aquila", "Drago",
  "Cobra", "Pantera", "Ghepardo", "Squalo", "Lince", "Corvo", "Bisonte",
];

export const AVATAR_COLORS = [
  { id: "blue",    hex: "#3b82f6", label: "Blu",        free: true  },
  { id: "red",     hex: "#ef4444", label: "Rosso",      free: false },
  { id: "green",   hex: "#22c55e", label: "Verde",      free: false },
  { id: "yellow",  hex: "#f59e0b", label: "Giallo",     free: false },
  { id: "purple",  hex: "#8b5cf6", label: "Viola",      free: false },
  { id: "orange",  hex: "#f97316", label: "Arancione",  free: false },
  { id: "pink",    hex: "#ec4899", label: "Rosa",       free: false },
  { id: "teal",    hex: "#14b8a6", label: "Turchese",   free: false },
];

export const COLOR_PRICE = 50;

interface UserContextType {
  username: string | null;
  coins: number;
  avatarColor: string;
  purchasedColors: string[];
  bestStreak: number;
  questionsAnswered: number;
  dailyStreak: number;
  usernameReady: boolean;
  setUsername: (name: string) => Promise<{ success: boolean; error?: string }>;
  generateRandomUsername: () => string;
  purchaseColor: (colorId: string) => Promise<boolean>;
  selectColor: (colorId: string) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  updateBestStreak: (score: number) => Promise<void>;
  incrementQuestions: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [avatarColor, setAvatarColorState] = useState("#3b82f6");
  const [purchasedColors, setPurchasedColors] = useState<string[]>(["blue"]);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [usernameReady, setUsernameReady] = useState(false);

  useEffect(() => {
    loadAll();

    // Listener auth: pulisce username al logout, lo carica dal profilo al login
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUsernameState(null);
        await AsyncStorage.removeItem("username");
        setUsernameReady(true);
      } else if (event === "SIGNED_IN" && session?.user) {
        // Carica username dai metadati utente Supabase (salvato al primo set)
        const metaUsername = session.user.user_metadata?.app_username as string | undefined;
        if (metaUsername) {
          setUsernameState(metaUsername);
          await AsyncStorage.setItem("username", metaUsername);
        }
        setUsernameReady(true);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadAll = async () => {
    try {
      const [un, c, ac, pc, bs, qa, ds] = await Promise.all([
        AsyncStorage.getItem("username"),
        AsyncStorage.getItem("coins"),
        AsyncStorage.getItem("avatar_color"),
        AsyncStorage.getItem("purchased_colors"),
        AsyncStorage.getItem("popular_record"),
        AsyncStorage.getItem("questions_answered_total"),
        AsyncStorage.getItem("daily_reward_streak"),
      ]);
      setUsernameState(un);
      setCoins(c ? parseInt(c) : 0);
      setAvatarColorState(ac || "#3b82f6");
      setPurchasedColors(pc ? JSON.parse(pc) : ["blue"]);
      setBestStreak(bs ? parseInt(bs) : 0);
      setQuestionsAnswered(qa ? parseInt(qa) : 0);
      setDailyStreak(ds ? parseInt(ds) : 0);
    } catch (e) {
      console.error("UserContext load error:", e);
    } finally {
      setUsernameReady(true);
    }
  };

  const generateRandomUsername = (): string => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const num = Math.floor(Math.random() * 999);
    return `${adj}${animal}${num}`;
  };

  const setUsername = async (name: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return { success: false, error: "Minimo 3 caratteri" };
    if (trimmed.length > 20) return { success: false, error: "Massimo 20 caratteri" };
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return { success: false, error: "Solo lettere, numeri e _" };

    try {
      // Controlla unicità
      const { data } = await supabase
        .from("usernames")
        .select("username")
        .eq("username", trimmed)
        .maybeSingle();

      if (data) return { success: false, error: "Username già in uso!" };

      // Inserisci su Supabase (tabella usernames per unicità)
      const { error } = await supabase.from("usernames").insert({ username: trimmed });
      if (error && error.code === "23505") return { success: false, error: "Username già in uso!" };

      // Salva anche nei metadati dell'account (per ritrovarlo al prossimo login)
      await supabase.auth.updateUser({ data: { app_username: trimmed } });
    } catch {
      // Se offline, salva lo stesso in locale
    }

    await AsyncStorage.setItem("username", trimmed);
    setUsernameState(trimmed);
    return { success: true };
  };

  const purchaseColor = async (colorId: string): Promise<boolean> => {
    const color = AVATAR_COLORS.find(c => c.id === colorId);
    if (!color) return false;

    // Già sbloccato → seleziona e basta
    if (color.free || purchasedColors.includes(colorId)) {
      await selectColor(colorId);
      return true;
    }

    if (coins < COLOR_PRICE) return false;

    const newCoins = coins - COLOR_PRICE;
    const newPurchased = [...purchasedColors, colorId];

    setCoins(newCoins);
    setPurchasedColors(newPurchased);
    setAvatarColorState(color.hex);

    await Promise.all([
      AsyncStorage.setItem("coins", newCoins.toString()),
      AsyncStorage.setItem("purchased_colors", JSON.stringify(newPurchased)),
      AsyncStorage.setItem("avatar_color", color.hex),
    ]);
    return true;
  };

  const selectColor = async (colorId: string): Promise<void> => {
    const color = AVATAR_COLORS.find(c => c.id === colorId);
    if (!color) return;
    if (!color.free && !purchasedColors.includes(colorId)) return;
    setAvatarColorState(color.hex);
    await AsyncStorage.setItem("avatar_color", color.hex);
  };

  const addCoins = async (amount: number): Promise<void> => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    await AsyncStorage.setItem("coins", newCoins.toString());
  };

  const updateBestStreak = async (score: number): Promise<void> => {
    if (score > bestStreak) {
      setBestStreak(score);
      await AsyncStorage.setItem("popular_record", score.toString());
    }
  };

  const incrementQuestions = async (): Promise<void> => {
    const next = questionsAnswered + 1;
    setQuestionsAnswered(next);
    await AsyncStorage.setItem("questions_answered_total", next.toString());
  };

  return (
    <UserContext.Provider value={{
      username, coins, avatarColor, purchasedColors, bestStreak,
      questionsAnswered, dailyStreak, usernameReady,
      setUsername, generateRandomUsername, purchaseColor, selectColor,
      addCoins, updateBestStreak, incrementQuestions,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
