import { useUser } from "@clerk/clerk-expo";
import { RessourceCreateBody, RessourceEntity } from "../types/ressources";
import { UserEntity } from "../types/user";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function getRessources() {
  try {
    const { user } = useUser();

    const userResponse = await fetch(`${BASE_URL}/users/${user?.id}`);
    const dbUser = (await userResponse.json()) as UserEntity;

    if (!dbUser) {
      console.log(
        "Une erreur est survenue lors de la récupération de l'utilisateur depuis la DB."
      );
    }

    const response = await fetch(`${BASE_URL}/ressources`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    let resourcesList: RessourceEntity[] =
      result.data || ([] as RessourceEntity[]);
    console.log(dbUser);

    resourcesList = resourcesList.filter(
      (x) =>
        x.ressourceTypeId === 1 ||
        (x.ressourceTypeId !== 1 && x.userId === dbUser.id)
    );
    return resourcesList;
  } catch (err) {
    console.error("Erreur lors de la récupération des ressources:", err);
  }
}

export async function createRessource(data: RessourceCreateBody) {
  try {
    const response = await fetch(`${BASE_URL}/ressources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.log(e);
  }
}

export async function getRessourceTypes() {
  try {
    const response = await fetch(`${BASE_URL}/ressourceTypes`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    return result.data;
  } catch (e) {
    console.log(e);
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    return result.data;
  } catch (e) {
    console.log(e);
  }
}
