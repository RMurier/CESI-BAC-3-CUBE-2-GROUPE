import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import Spinner from "react-native-loading-spinner-overlay";
import { useState } from "react";
import { Stack } from "expo-router";

const Register = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Create the user and send the verification email
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      // Create the user on Clerk
      await signUp.create({
        username: name,
        emailAddress,
        password,
      });

      // Send verification Email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // change the UI to verify the email address
      setPendingVerification(true);
    } catch (err: any) {
      alert(
        err.errors && err.errors[0]
          ? err.errors[0].message
          : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify the email address
  const onPressVerify = async () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });

      const response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId: completeSignUp.createdUserId,
          name: completeSignUp.username,
          email: completeSignUp.emailAddress,
          roleId: 1,
        }),
      });
    } catch (err: any) {
      alert(
        err.errors && err.errors[0]
          ? err.errors[0].message
          : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
      <Spinner visible={loading} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Inscription</Text>
      </View>

      <View style={styles.formContainer}>
        {!pendingVerification && (
          <>
            <TextInput
              autoCapitalize="none"
              placeholder="Votre nom"
              value={name}
              onChangeText={setName}
              style={styles.inputField}
            />
            <TextInput
              autoCapitalize="none"
              placeholder="exemple@mail.dev"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={styles.inputField}
            />
            <TextInput
              placeholder="password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={styles.inputField}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onSignUpPress}
            >
              <Text style={styles.primaryButtonText}>JE M'INSCRIS</Text>
            </TouchableOpacity>
          </>
        )}

        {pendingVerification && (
          <>
            <View>
              <TextInput
                keyboardType="numeric"
                value={code}
                placeholder="Code..."
                style={styles.inputField}
                onChangeText={setCode}
              />
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onPressVerify}
            >
              <Text style={styles.primaryButtonText}>VÉRIFIER L'EMAIL</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  headerContainer: {
    backgroundColor: "#09B1B9",
    padding: 16,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
  },
  inputField: {
    marginVertical: 8,
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#09B1B9",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Register;
