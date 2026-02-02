import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../app/contexts/AuthContext";
import { useSettings } from "../app/contexts/SettingsContext";
import { useRouter } from "expo-router";

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ visible, onClose }: HamburgerMenuProps) {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { colors, vibrate } = useSettings();
  const router = useRouter();

  const handleLogin = async () => {
    vibrate("medium");
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    vibrate("medium");
    await signOut();
    onClose();
  };

  const handleSettings = () => {
    vibrate("light");
    onClose();
    router.push("/settings");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground }]}>
          {user ? (
            <>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle-outline" size={28} color={colors.text} />
                <Text style={[styles.userText, { color: colors.text }]}>
                  {user.email}
                </Text>
              </View>
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.menuItem} onPress={handleLogin}>
              <Ionicons name="log-in-outline" size={22} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Login Google</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Impostazioni</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  menuContainer: {
    width: 220,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 20,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  userText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
