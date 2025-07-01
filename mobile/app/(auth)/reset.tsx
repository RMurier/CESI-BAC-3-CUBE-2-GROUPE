import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import Spinner from "react-native-loading-spinner-overlay";

const PwReset = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, setActive } = useSignIn();

  // Request a password reset code by email
  const onRequestReset = async () => {
    setLoading(true);
    try {
      if (!signIn) return;
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
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

  // Reset the password with the code and the new password
  const onReset = async () => {
    setLoading(true);
    try {
      if (!signIn) return;
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      alert("Mot de passe réinitialisé avec succès");

      // Set the user session active, which will log in the user automatically
      await setActive({ session: result.createdSessionId });
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
      <Stack.Screen options={{ headerBackVisible: !successfulCreation }} />
      <Spinner visible={loading} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Réinitialisation du mot de passe</Text>
      </View>

      <View style={styles.formContainer}>
        {!successfulCreation && (
          <>
            <TextInput
              autoCapitalize="none"
              placeholder="exemple@mail.fr"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={styles.inputField}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRequestReset}
            >
              <Text style={styles.primaryButtonText}>
                ENVOYER LE MAIL DE RÉINITIALISATION
              </Text>
            </TouchableOpacity>
          </>
        )}

        {successfulCreation && (
          <>
            <View>
              <TextInput
                value={code}
                placeholder="Code..."
                style={styles.inputField}
                onChangeText={setCode}
              />
              <TextInput
                placeholder="Nouveau mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.inputField}
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={onReset}>
              <Text style={styles.primaryButtonText}>
                DÉFINIR LE NOUVEAU MOT DE PASSE
              </Text>
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

export default PwReset;
