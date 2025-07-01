// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import axios from "axios";

type User = {
  id: number;
  clerkUserId: string;
  email: string;
  name: string | null;
  role: {
    id: number;
    name: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean | undefined;
  isAdmin: boolean;
  token: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isSignedIn: undefined,
  isAdmin: false,
  token: null,
});

export const useAuthContext = () => useContext(AuthContext);

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const url = process.env.API_BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (isSignedIn && clerkUser) {
        try {
          const jwt = await getToken();
          setToken(jwt);

          axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

          const response = await axios.get(`${url}/users/${user?.clerkUserId}`);
          setUser(response.data);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur:",
            error
          );
        }
      } else {
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common["Authorization"];
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [isSignedIn, clerkUser]);

  const isAdmin = user?.role?.name === "admin";

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isSignedIn, isAdmin, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}
