import { Stack } from "expo-router";
import { SettingsProvider } from "../contexts/SettingsContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <SettingsProvider>
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
    </SettingsProvider>
  );
}
