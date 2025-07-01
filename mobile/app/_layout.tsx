import { Redirect, Slot, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "../utils/tokenCache";
import AuthContextProvider from "../contexts/AuthContext";
import { NavigationContainer } from "@react-navigation/native";

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isLoaded) return;

  //   const inTabsGroup = segments[0] === "(main)";

  //   // console.log("User changed: ", isSignedIn);

  //   if (isSignedIn && !inTabsGroup) {
  //     router.replace("/home");
  //   } else if (!isSignedIn) {
  //     router.replace("/login");
  //   }
  // }, [isSignedIn]);

  return <Slot />;
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Missing Publishable key for Clerk.");
  }
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <InitialLayout />
    </ClerkProvider>
  );
}
