import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function HomeLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/login"} />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ressource"
        options={{
          title: "Ressources",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="[id]" options={{ href: null }} />
    </Tabs>
  );
}
