import { View, Text, Button } from "react-native";
import React from "react";
import { useAuth, useSignIn, useUser } from "@clerk/clerk-expo";

const Home = () => {
  const { user } = useUser();

  const { signOut } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome, {user?.emailAddresses[0].emailAddress} 🎉</Text>
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
};

export default Home;
