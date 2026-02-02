import { Stack } from "expo-router";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext"; // <— aggiunto
import { StatusBar } from "expo-status-bar";


export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider> {/* <— AuthProvider avvolge tutta l’app */}
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="game" />
          <Stack.Screen name="settings" />
        </Stack>
      </AuthProvider>
    </SettingsProvider>
  );
}
