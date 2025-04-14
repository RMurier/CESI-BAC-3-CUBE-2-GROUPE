// app/ressources/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { UserEntity } from "../../../types/user";
import { RessourceEntity } from "../../../types/ressources";

interface Comment {
  id: number;
  content: string;
  publishedAt: string;
  authorId: number;
  author: UserEntity;
  ressourceId: number;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
  isActive: boolean;
  categoryId: number;
  ressourceTypeId: number;
}

export default function ResourceDetailScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();

  const [resource, setResource] = useState<RessourceEntity | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchResourceDetails();
    fetchComments();
  }, [id]);

  const fetchResourceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/ressources/${id}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      setResource(result.data);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des détails de la ressource:",
        err
      );
      setError("Impossible de charger les détails de la ressource.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${apiUrl}/ressources/${id}/comments`);
      console.log(`${apiUrl}/ressources/${id}/comments`);
      // console.log(response);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      setComments(result.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des commentaires:", err);
      // On ne définit pas d'erreur ici pour ne pas bloquer l'affichage de la ressource
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      // console.log("USERID", userId);
      setSubmittingComment(true);
      const response = await fetch(`${apiUrl}/ressources/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          authorId: userId, // Utilisez l'ID de l'utilisateur connecté via Clerk
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Réinitialiser le champ et rafraîchir les commentaires
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Erreur lors de l'envoi du commentaire:", err);
      Alert.alert(
        "Erreur",
        "Impossible d'envoyer votre commentaire. Veuillez réessayer plus tard."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Veuillez vous connecter pour accéder aux ressources
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            fetchResourceDetails();
            fetchComments();
          }}
        >
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ressource introuvable</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0066cc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Détails de la ressource
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resourceCard}>
          <View style={styles.resourceHeader}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            {resource.isActive && <View style={styles.activeIndicator} />}
          </View>

          <Text style={styles.dateText}>
            Créé le {formatDate(resource.createdAt.toString())}
          </Text>

          <Text style={styles.dateText}>
            Dernière modification le{" "}
            {formatDate(resource.modifiedAt.toString())}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{resource.description}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Catégorie :</Text>
              <Text style={styles.metaValue}>{resource.category.name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Type de ressource :</Text>
              <Text style={styles.metaValue}>
                {resource.ressourceType.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentTitle}>
              Commentaires ({comments.length})
            </Text>
            <TouchableOpacity onPress={fetchComments}>
              <Ionicons name="refresh-outline" size={20} color="#0066cc" />
            </TouchableOpacity>
          </View>

          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>
              Aucun commentaire pour cette ressource
            </Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentAuthor}>
                    Auteur : {comment.author.name}
                  </Text>
                  <Text style={styles.commentDate}>
                    {formatDate(comment.publishedAt)}
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.addCommentSection}>
            <Text style={styles.addCommentTitle}>Ajouter un commentaire</Text>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Votre commentaire..."
              multiline
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!newComment.trim() || submittingComment) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={submitComment}
              disabled={!newComment.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Publier</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  resourceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  dateText: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 16,
  },
  metaContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
  },
  metaItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 14,
    color: "#666",
    width: 130,
  },
  metaValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  commentsSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  noCommentsText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },
  commentContent: {
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
  },
  commentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentAuthor: {
    fontSize: 12,
    color: "#666",
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
  },
  addCommentSection: {
    marginTop: 20,
  },
  addCommentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#fdfdfd",
    marginBottom: 12,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#a0c5e8",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  button: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
