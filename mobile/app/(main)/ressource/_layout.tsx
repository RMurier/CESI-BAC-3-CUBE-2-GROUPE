// app/ressources/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ResourcesLayout() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#333333",
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Ressources",
          headerShown: false,
          headerRight: () =>
            isSignedIn ? (
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                style={{ marginRight: 15 }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  color="#0066cc"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/sign-in")}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="log-in-outline" size={24} color="#0066cc" />
              </TouchableOpacity>
            ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Détail de la ressource",
          headerShown: false,
          headerBackTitle: "Ressources",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#0066cc" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Créer une ressource",
          headerShown: false,
          headerBackTitle: "Ressources",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#0066cc" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
