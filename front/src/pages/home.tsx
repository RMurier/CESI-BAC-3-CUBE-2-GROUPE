import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Afficher un loader pendant que Clerk charge
  if (!isLoaded) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Bonjour {user?.username} !!!!!!!!!
      </h1>
      <p className="text-gray-600 mb-6">
        Bienvenue sur le back office de{" "}
        <span className="font-semibold">CUBE 2 GROUPE test</span>.
      </p>
    </div>
  );
};
