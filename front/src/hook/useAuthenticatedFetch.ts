import { useAuth } from "@clerk/clerk-react";
import { useState, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// Types pour les options de fetch
interface AuthenticatedFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

// Type générique pour les réponses API
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

// Type pour les callbacks
type OnSuccessCallback<T = any> = (data: ApiResponse<T>) => void;
type OnErrorCallback = (error: Error | string) => void;

// Type de retour du hook
interface UseAuthenticatedFetchReturn {
  authenticatedFetch: <T = any>(
    endpoint: string,
    options?: AuthenticatedFetchOptions,
    onSuccess?: OnSuccessCallback<T> | null,
    onError?: OnErrorCallback | null
  ) => Promise<ApiResponse<T> | null>;
  loading: boolean;
  isSignedIn: boolean;
  isLoaded: boolean;
}

export const useAuthenticatedFetch = (): UseAuthenticatedFetchReturn => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  console.log("Hook useAuthenticatedFetch - État Clerk:", {
    isLoaded,
    isSignedIn,
    loading,
  });

  const authenticatedFetch = useCallback(
    async <T = any>(
      endpoint: string,
      options: AuthenticatedFetchOptions = {},
      onSuccess: OnSuccessCallback<T> | null = null,
      onError: OnErrorCallback | null = null
    ): Promise<ApiResponse<T> | null> => {
      console.log("🚀 authenticatedFetch appelé pour:", endpoint);
      console.log("📊 État au moment de l'appel:", { isLoaded, isSignedIn });

      if (!isLoaded) {
        const errorMessage = "Clerk pas encore chargé";
        console.warn("⚠️", errorMessage);
        if (onError) onError(errorMessage);
        return null;
      }

      if (!isSignedIn) {
        const errorMessage = "Utilisateur non connecté";
        console.error("❌", errorMessage);
        if (onError) onError(errorMessage);
        return null;
      }

      console.log("✅ Vérifications passées, début de la requête");
      setLoading(true);

      try {
        console.log("🔑 Récupération du token...");
        const token = await getToken();

        if (!token) {
          throw new Error("Impossible de récupérer le token");
        }

        console.log("✅ Token récupéré:", token.substring(0, 20) + "...");

        console.log("🌐 Appel fetch vers:", `${BASE_URL}${endpoint}`);
        const res = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        console.log("📡 Réponse reçue - Status:", res.status);
        console.log("📋 Response headers:", res.headers);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        console.log("📦 Parsing JSON...");
        const data: ApiResponse<T> = await res.json();
        console.log("✅ Données reçues:", data);

        if (onSuccess) {
          console.log("🎯 Appel du callback onSuccess");
          onSuccess(data);
        }

        return data;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        console.error("💥 Erreur dans authenticatedFetch:", errorObj);

        if (onError) {
          console.log("🎯 Appel du callback onError");
          onError(errorObj);
        }
        throw errorObj;
      } finally {
        console.log("🏁 Fin de authenticatedFetch - setLoading(false)");
        setLoading(false);
      }
    },
    [getToken, isSignedIn, isLoaded]
  );

  return {
    authenticatedFetch,
    loading,
    isSignedIn: isSignedIn ?? false,
    isLoaded: isLoaded ?? false,
  };
};
