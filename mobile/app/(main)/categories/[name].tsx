import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RessourceEntity } from "../../../types/ressources";

const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

const CategoryScreen = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const [ressources, setRessources] = useState<RessourceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    const fetchRessources = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/categories/${encodeURIComponent(name)}/ressources`
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        setRessources(result.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des ressources :", err);
        setError("Impossible de charger les ressources.");
      } finally {
        setLoading(false);
      }
    };

    fetchRessources();
  }, [name]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.message}>Chargement des ressources...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>

      <ScrollView contentContainerStyle={styles.container}>
        {ressources.length === 0 ? (
          <Text style={styles.message}>Aucune ressource trouvée.</Text>
        ) : (
          ressources.map((ressource) => (
            <TouchableOpacity
              key={ressource.id}
              style={styles.card}
              onPress={() => router.push(`/ressource/${ressource.id}`)}
            >
              <Text style={styles.cardTitle}>{ressource.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {ressource.description}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  message: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  error: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#0066cc",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
