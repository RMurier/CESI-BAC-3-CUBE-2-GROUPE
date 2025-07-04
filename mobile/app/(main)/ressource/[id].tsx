// app/ressources/[id].tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { RessourceEntity } from "../../../types/ressources";
import { CommentEntity } from "../../../types/comment";
import { useApiWithAuth } from "../../../services/api";
import { UserEntity } from "../../../types/user";

type CommentWithReplies = CommentEntity & {
  replies?: CommentWithReplies[];
};

export default function ResourceDetailScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const commentInputRef = useRef<TextInput>(null);

  const [resource, setResource] = useState<RessourceEntity | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentEntity | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [showShareList, setShowShareList] = useState(false);
  const [currentDbUser, setCurrentDbUser] = useState<UserEntity | null>(null);

  // Animation pour les nouveaux commentaires
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const {
    changeLike,
    createRessource,
    getCategories,
    getCurrentUser,
    getRessourceTypes,
    getRessources,
  } = useApiWithAuth();
  useEffect(() => {
    fetchResourceDetails();
    fetchComments();
    loadCurrentUser();
  }, [id]);

  useEffect(() => {
    if (showShareList) {
      fetchUsers();
    }
  }, [showShareList]);

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
      setError("Impossible de charger les détails de la ressource.");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    if (userId) {
      const user = await getCurrentUser(userId);
      setCurrentDbUser(user);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/users`);
      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les utilisateurs.");
    }
  };

  const shareWithUser = async (targetUserId: number) => {
    try {
      const response = await fetch(`${apiUrl}/ressources/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (!response.ok) throw new Error("Échec du partage");

      Alert.alert("Succès", "Ressource partagée !");
      setShowShareList(false);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de partager la ressource.");
    }
  };

  const fetchComments = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${apiUrl}/ressources/${id}/comments`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      // Organiser les commentaires en hiérarchie (parents et réponses)
      const commentsData = result.data || [];
      const commentMap = new Map();
      const rootComments: CommentWithReplies[] = [];

      // Première passe: créer un Map de tous les commentaires
      commentsData.forEach((comment: CommentEntity) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Deuxième passe: organiser en hiérarchie
      commentsData.forEach((comment: CommentEntity) => {
        const commentWithReplies = commentMap.get(comment.id);
        if (comment.parentId) {
          // C'est une réponse, l'ajouter au parent
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(commentWithReplies);
          } else {
            // Parent non trouvé, traiter comme un commentaire racine
            rootComments.push(commentWithReplies);
          }
        } else {
          // C'est un commentaire racine
          rootComments.push(commentWithReplies);
        }
      });

      // Trier les commentaires racines par date (plus récents en premier)
      const sortedRootComments = rootComments.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      // Trier également les réponses par date (plus anciennes en premier pour les réponses)
      sortedRootComments.forEach((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.sort(
            (a, b) =>
              new Date(a.publishedAt).getTime() -
              new Date(b.publishedAt).getTime()
          );
        }
      });

      setComments(sortedRootComments);
    } catch (err) {
      Alert.alert("Erreur lors de la récupération des commentaires");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchComments();
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      if (!userId) {
        throw new Error("Clerk user id not found.");
      }

      const user = await getCurrentUser(userId);

      if (!user) {
        throw new Error("User could not be found in the database.");
      }

      const response = await fetch(`${apiUrl}/ressources/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          authorId: user.id,
          parentId: replyTo?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Animation du nouveau commentaire
      fadeAnim.setValue(0);

      // Réinitialiser le champ et rafraîchir les commentaires
      setNewComment("");
      setReplyTo(null);
      await fetchComments();

      // Faire défiler jusqu'au nouveau commentaire
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
        // Afficher l'animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 100);
    } catch (err) {
      Alert.alert(
        "Erreur",
        "Impossible d'envoyer votre commentaire. Veuillez réessayer plus tard."
      );
    } finally {
      setSubmittingComment(false);
      Keyboard.dismiss();
    }
  };

  const handleReply = (comment: CommentEntity) => {
    setReplyTo(comment);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };

  const toggleLike = async (commentId: string) => {
    const user = await getCurrentUser(userId!);

    if (!user) throw new Error("User not found in database.");

    const newLikedComments = new Set(likedComments);
    if (likedComments.has(commentId)) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    setLikedComments(newLikedComments);
    console.log("comment id:", commentId, "userId:", user.id);

    changeLike(commentId, user.id);
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return "à l'instant";
    } else if (diffMinutes < 60) {
      return `il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours} h`;
    } else if (diffDays < 7) {
      return `il y a ${diffDays} j`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
    }
  };

  // Composant pour afficher un commentaire et ses réponses
  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: CommentWithReplies;
    isReply?: boolean;
  }) => (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAuthorContainer}>
          <View
            style={[styles.commentAvatar, isReply && styles.commentReplyAvatar]}
          >
            <Text
              style={[
                styles.commentAvatarText,
                isReply && styles.commentReplyAvatarText,
              ]}
            >
              {comment.author?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.commentAuthorName}>
            {comment.author?.name || "Utilisateur"}
          </Text>
        </View>
        <Text style={styles.commentDate}>
          {formatDate(comment.publishedAt.toString())}
        </Text>
      </View>

      <Text style={styles.commentContent}>{comment.content}</Text>

      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.commentAction}
          onPress={() => toggleLike(comment.id)}
        >
          <AntDesign
            name={likedComments.has(comment.id) ? "heart" : "hearto"}
            size={16}
            color={likedComments.has(comment.id) ? "#FF3B30" : "#666"}
          />
          <Text
            style={[
              styles.commentActionText,
              likedComments.has(comment.id) && styles.commentActionTextActive,
            ]}
          >
            J'aime
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.commentAction}
          onPress={() => handleReply(comment)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentActionText}>Répondre</Text>
        </TouchableOpacity>
      </View>

      {/* Afficher les réponses s'il y en a */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </View>
      )}
    </View>
  );

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
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
        {currentDbUser?.id === resource?.userId && (
          <TouchableOpacity
            onPress={() => {
              fetchUsers();
              setShowShareList(!showShareList);
            }}
          >
            <Ionicons name="person-add" size={24} color="#0066cc" />
          </TouchableOpacity>
        )}
      </View>

      {showShareList && (
        <View style={{ padding: 16, backgroundColor: "#f0f0f0" }}>
          <Text style={{ marginBottom: 8, fontWeight: "bold" }}>
            Partager avec :
          </Text>

          {users.length === 0 ? (
            <Text style={{ fontStyle: "italic", color: "#888" }}>
              Aucun utilisateur à afficher.
            </Text>
          ) : (
            users
              .filter((u) => u.id !== currentDbUser?.id)
              .map((u) => (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => shareWithUser(u.id)}
                  style={{
                    backgroundColor: "#fff",
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                  }}
                >
                  <Text>{u.name || u.email}</Text>
                </TouchableOpacity>
              ))
          )}
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
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
            <TouchableOpacity onPress={handleRefresh}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#0066cc" />
              ) : (
                <Ionicons name="refresh-outline" size={20} color="#0066cc" />
              )}
            </TouchableOpacity>
          </View>

          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>
              Aucun commentaire pour cette ressource
            </Text>
          ) : (
            comments.map((comment, index) => (
              <Animated.View key={comment.id} style={[{ opacity: 1 }]}>
                <CommentItem comment={comment} />
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Zone de commentaire fixe en bas */}
      <View style={styles.commentInputContainer}>
        {replyTo && (
          <View style={styles.replyContainer}>
            <Text style={styles.replyText}>
              Répondre à{" "}
              <Text style={styles.replyName}>
                {replyTo.author?.name || "utilisateur"}
              </Text>
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.commentAvatarSmall}>
            <Text style={styles.commentAvatarTextSmall}>
              {/* Première lettre du nom de l'utilisateur connecté */}
              {userId?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>

          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder={
              replyTo ? "Écrivez une réponse..." : "Ajouter un commentaire..."
            }
            multiline
            maxLength={500}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newComment.trim() || submittingComment) &&
                styles.sendButtonDisabled,
            ]}
            onPress={submitComment}
            disabled={!newComment.trim() || submittingComment}
          >
            {submittingComment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={!newComment.trim() ? "#a0c5e8" : "#fff"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 80, // Espace pour la zone de commentaire
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  replyItem: {
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
    borderBottomWidth: 0,
    marginTop: 8,
  },
  repliesContainer: {
    marginLeft: 20,
    marginTop: 4,
  },
  commentAuthorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  commentReplyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#5c8dc8",
  },
  commentAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentReplyAvatarText: {
    fontSize: 12,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    marginVertical: 6,
    lineHeight: 20,
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 4,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  commentActionTextActive: {
    color: "#FF3B30",
  },
  commentInputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  replyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  replyText: {
    fontSize: 12,
    color: "#666",
  },
  replyName: {
    fontWeight: "600",
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  commentAvatarTextSmall: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: "#fdfdfd",
    color: "#333",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#a0c5e8",
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
