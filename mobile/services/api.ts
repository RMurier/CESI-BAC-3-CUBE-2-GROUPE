import { useAuth, useUser } from "@clerk/clerk-expo";
import { RessourceCreateBody, RessourceEntity } from "../types/ressources";
import { UserEntity } from "../types/user";
import { CommentCreateBody, CommentEntity } from "../types/comment";
import { router } from "expo-router";
import { HttpStatusCode } from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Fonction utilitaire pour récupérer le token et créer les headers
// async function getAuthHeaders() {
//   try {
//     const { getToken } = useAuth();
//     const token = await getToken();

//     return {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   } catch (error) {
//     console.error("Erreur lors de la récupération du token:", error);
//     return {
//       "Content-Type": "application/json",
//     };
//   }
// }

// async function fetchData(endpoint: string, options: RequestInit = {}) {
//   try {
//     console.log(BASE_URL);
//     // Fusionner les headers par défaut avec ceux fournis
//     const defaultHeaders = await getAuthHeaders();
//     const headers = {
//       ...defaultHeaders,
//       ...options.headers,
//     };

//     const response = await fetch(`${BASE_URL}${endpoint}`, {
//       ...options,
//       headers,
//     });

//     if (!response.ok) {
//       // Gestion spécifique des erreurs d'authentification
//       if (response.status === 401) {
//         console.error("Token expiré ou invalide");
//         // Optionnel: rediriger vers la page de connexion
//         // router.replace("/login");
//         throw new Error("Non autorisé - Token invalide");
//       }
//       throw new Error(`Erreur HTTP: ${response.status}`);
//     }

//     const result = await response.json();
//     return result.data || [];
//   } catch (error) {
//     console.error(`Erreur lors de la requête à ${endpoint}:`, error);
//     throw error;
//   }
// }

export function useApiWithAuth() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  const authenticatedFetch = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    if (!isSignedIn) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      const token = await getToken();
      console.log("BASE_URL : ", BASE_URL);

      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Token expiré ou invalide");
          throw new Error("Non autorisé - Token invalide");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("result : ", result.data);

      return result.data || [];
    } catch (error) {
      console.error(`Erreur lors de la requête à ${endpoint}:`, error);
      throw error;
    }
  };

  return {
    getCurrentUser: async (userId: string): Promise<UserEntity | null> => {
      try {
        const dbUser = await authenticatedFetch(`/users/${userId}`);

        if (!dbUser) {
          console.log(
            "Une erreur est survenue lors de la récupération de l'utilisateur depuis la DB."
          );
          return null;
        }

        return dbUser;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          error
        );
        return null;
      }
    },

    getRessources: async () => {
      try {
        if (!user) {
          console.error("Utilisateur non connecté");
          return [];
        }

        const dbUser = await authenticatedFetch(`/users/${user.id}`);
        console.log("dbUser : ", dbUser);
        if (!dbUser) {
          return [];
        }

        const resourcesList = await authenticatedFetch("/ressources");

        return resourcesList.filter(
          (resource: RessourceEntity) =>
            resource.ressourceTypeId === 1 ||
            (resource.ressourceTypeId !== 1 && resource.userId === dbUser.id)
        );
      } catch (error) {
        console.error("Erreur lors de la récupération des ressources:", error);
        return [];
      }
    },

    createRessource: async (data: RessourceCreateBody) => {
      try {
        return await authenticatedFetch("/ressources", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Erreur lors de la création de la ressource:", error);
        throw error;
      }
    },

    getRessourceTypes: async () => {
      try {
        return await authenticatedFetch("/ressourceTypes");
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des types de ressources:",
          error
        );
        return [];
      }
    },

    getCategories: async () => {
      try {
        return await authenticatedFetch("/categories");
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        return [];
      }
    },

    changeLike: async (commentId: string, userId: number) => {
      try {
        return await authenticatedFetch(`/comments/${commentId}/like`, {
          method: "POST",
          body: JSON.stringify({ userId }),
        });
      } catch (error) {
        console.error("Erreur lors de la modification du like:", error);
        return [];
      }
    },
  };
}

// // Version alternative si vous préférez garder les fonctions exportées directement
// export async function getCurrentUser(
//   userId: string
// ): Promise<UserEntity | null> {
//   try {
//     const dbUser = await fetchData(`/users/${userId}`);

//     if (!dbUser) {
//       console.log(
//         "Une erreur est survenue lors de la récupération de l'utilisateur depuis la DB."
//       );
//       return null;
//     }

//     return dbUser;
//   } catch (error) {
//     console.error("Erreur lors de la récupération de l'utilisateur:", error);
//     return null;
//   }
// }

// export async function getRessources() {
//   try {
//     const { user } = useUser();

//     if (!user) {
//       console.error("Utilisateur non connecté");
//       return [];
//     }

//     const dbUser = await getCurrentUser(user.id);

//     if (!dbUser) {
//       return [];
//     }

//     const resourcesList = await fetchData("/ressources");

//     // Filtrer les ressources: type 1 ou celles appartenant à l'utilisateur
//     return resourcesList.filter(
//       (resource: RessourceEntity) =>
//         resource.ressourceTypeId === 1 ||
//         (resource.ressourceTypeId !== 1 &&
//           resource.userId === dbUser.clerkUserId)
//     );
//   } catch (error) {
//     console.error("Erreur lors de la récupération des ressources:", error);
//     return [];
//   }
// }

// export async function createRessource(data: RessourceCreateBody) {
//   try {
//     return await fetchData("/ressources", {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   } catch (error) {
//     console.error("Erreur lors de la création de la ressource:", error);
//     throw error;
//   }
// }

// export async function getRessourceTypes() {
//   try {
//     return await fetchData("/ressourceTypes");
//   } catch (error) {
//     console.error(
//       "Erreur lors de la récupération des types de ressources:",
//       error
//     );
//     return [];
//   }
// }

// export async function getCategories() {
//   try {
//     return await fetchData("/categories");
//   } catch (error) {
//     console.error("Erreur lors de la récupération des catégories:", error);
//     return [];
//   }
// }

// export async function changeLike(commentId: string, userId: number) {
//   try {
//     return await fetchData(`/comments/${commentId}/like`, {
//       method: "POST",
//       body: JSON.stringify({ userId }),
//     });
//   } catch (error) {
//     console.error("Erreur lors de la modification du like:", error);
//     return [];
//   }
// }
