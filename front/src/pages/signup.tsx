import { SignUp as SignUpClerk, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const SignUp = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const createUserInDatabase = async () => {
      if (!user) return;

      const emailVerified =
        user.emailAddresses[0]?.verification?.status === "verified";

      if (!emailVerified) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkUserId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: user.fullName,
          }),
        });

        if (res.ok) {
          navigate("/");
        } else {
          const err = await res.json();
          console.error("Erreur API :", err);
        }
      } catch (err) {
        console.error("Erreur lors de la création utilisateur :", err);
      }
    };

    if (isSignedIn && user) {
      createUserInDatabase();
    }
  }, [isSignedIn, user, navigate]);

  if (!isSignedIn) {
    return <SignUpClerk redirectUrl="/onboard" />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Création de votre compte...</p>
    </div>
  );
};
