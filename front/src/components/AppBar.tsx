import { useUser, SignOutButton, useClerk, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRoleStore } from "../stores/roleStore";

export function AppBar() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  const { setRoles } = useRoleStore();

  const checkRole = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      console.log("token", token);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res);

      if (res.ok) {
        let data = await res.json();
        console.log("AppBar data.data", data.data);
        setIsAdmin(
          data.data.role.name === "Admin" ||
            data.data.role.name === "Super-Admin"
        );
        if (data.data.roleId === 4) {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }
    if (isLoaded) {
      checkRole();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isAdmin === false) {
      (async () => {
        await signOut();
        navigate("/sign-in");
      })();
    }
    setRoles(isAdmin, isSuperAdmin);
  }, [isAdmin, signOut, navigate]);

  if (!isLoaded || (user && isAdmin === null)) {
    return (
      <div className="p-4 text-gray-500 text-sm text-center">Chargement...</div>
    );
  }

  if (!user) {
    return (
      <nav className="bg-white border-b shadow px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">CUBE 2 GROUPE</h1>
        <Link
          to="/sign-in"
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Connexion
        </Link>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b shadow px-6 py-3 flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <h1
          className="text-xl font-semibold text-gray-800"
          onClick={() => {
            navigate("/");
          }}
        >
          <div className="cursor-pointer">CUBE 2 GROUPE</div>
        </h1>
        {isSuperAdmin && (
          <Link
            to="/users"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Utilisateurs
          </Link>
        )}
        <Link
          to="/categories"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Catégories
        </Link>
        <Link
          to="/ressources"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Ressources
        </Link>

        <Link
          to="/stats"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Statistiques
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.username}</span>
        <SignOutButton>
          <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
            Déconnexion
          </button>
        </SignOutButton>
      </div>
    </nav>
  );
}
