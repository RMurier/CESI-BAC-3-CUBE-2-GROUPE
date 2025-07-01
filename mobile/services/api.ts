import { useUser } from "@clerk/clerk-expo";
import { RessourceCreateBody, RessourceEntity } from "../types/ressources";
import { UserEntity } from "../types/user";
import { CommentCreateBody, CommentEntity } from "../types/comment";
import { router } from "expo-router";
import { HttpStatusCode } from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function fetchData(endpoint: string, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    return result.data || [];
  } catch (error) {
    console.error(`Erreur lors de la requête à ${endpoint}:`, error);
    throw error;
  }
}

export async function getCurrentUser(
  userId: string
): Promise<UserEntity | null> {
  try {
    const dbUser = await fetchData(`/users/${userId}`);

    if (!dbUser) {
      console.log(
        "Une erreur est survenue lors de la récupération de l'utilisateur depuis la DB."
      );
      return null;
    }

    return dbUser;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
}

export async function getRessources() {
  try {
    const { user } = useUser();

    const dbUser = await getCurrentUser(user!.id);

    if (!dbUser) {
      return [];
    }

    const resourcesList = await fetchData("/ressources");

    // Filtrer les ressources: type 1 ou celles appartenant à l'utilisateur
    return resourcesList.filter(
      (resource: RessourceEntity) =>
        resource.ressourceTypeId === 1 ||
        (resource.ressourceTypeId !== 1 &&
          resource.userId === dbUser.clerkUserId)
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des ressources:", error);
    return [];
  }
}

export async function createRessource(data: RessourceCreateBody) {
  try {
    return await fetchData("/ressources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Erreur lors de la création de la ressource:", error);
    throw error;
  }
}

export async function getRessourceTypes() {
  try {
    return await fetchData("/ressourceTypes");
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types de ressources:",
      error
    );
    return [];
  }
}

export async function getCategories() {
  try {
    return await fetchData("/categories");
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

export async function changeLike(commentId: string, userId: number) {
  try {
    return await fetchData(`/comments/${commentId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types de ressources:",
      error
    );
    return [];
  }
}
