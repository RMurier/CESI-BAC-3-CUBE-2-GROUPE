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
import { useAuth } from "@clerk/clerk-expo";
import { RessourceEntity } from "../../../types/ressources";

const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

const CategoryScreen = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { userId } = useAuth();

  const [ressources, setRessources] = useState<RessourceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    const fetchRessources = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = userId
          ? `${apiUrl}/categories/${encodeURIComponent(
              name
            )}/accessible?clerkUserId=${encodeURIComponent(userId)}`
          : `${apiUrl}/categories/${encodeURIComponent(name)}/public`;

        const response = await fetch(endpoint);

        if (response.status === 404) {
          setError("❌ Cette catégorie n'existe pas.");
          return;
        }

        if (!response.ok) {
          console.log("Erreur HTTP:", response.status, response.statusText);
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        setRessources(result.data ?? []);
      } catch (err) {
        console.error("Erreur lors du chargement des ressources :", err);
        setError("Impossible de charger les ressources.");
      } finally {
        setLoading(false);
      }
    };

    fetchRessources();
  }, [name, userId]);

  const getTypeEmoji = (typeName?: string) => {
    switch (typeName?.toLowerCase()) {
      case "public":
        return "🌐";
      case "privé":
        return "🔒";
      default:
        return "📄";
    }
  };

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
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{ressource.title}</Text>
                <Text style={styles.typeIcon}>
                  {getTypeEmoji(ressource.ressourceType.name)}
                </Text>
              </View>
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
    textAlign: "center",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  typeIcon: {
    fontSize: 16,
    marginLeft: 8,
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
