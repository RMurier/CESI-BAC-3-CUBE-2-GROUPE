import { SignIn as SignInClerk, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const SignIn = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <SignInClerk
        appearance={{
          elements: {
            footer: "hidden", // cache tout le footer
            footerAction: "hidden", // sécurité au cas où
            footerActionText: "hidden", // texte "Don't have an account?"
            footerActionLink: "hidden", // lien vers sign-up
          },
        }}
      />
    </div>
  );
};
