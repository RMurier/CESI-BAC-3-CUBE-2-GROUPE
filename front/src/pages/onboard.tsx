import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Onboard = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const createUser = async () => {
    console.log("✅ Utilisateur Clerk connecté :", user, isSignedIn, isLoaded);
    if (!isLoaded || !isSignedIn || !user) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.username,
        }),
      });

      console.log("✅ Résultat API :", res.status);

      if (res.ok) {
        navigate("/");
      } else {
        const err = await res.json();
        console.error("❌ Erreur backend :", err);
      }
    } catch (err) {
      console.error("❌ Erreur réseau :", err);
    }
  };
  useEffect(() => {
    createUser();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Connexion en cours...</p>
    </div>
  );
};
