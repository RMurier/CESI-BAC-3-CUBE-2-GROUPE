import { useUser, SignOutButton, useClerk } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function AppBar() {
    const { user, isLoaded } = useUser();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const { signOut } = useClerk();
    const navigate = useNavigate();

    const checkRole = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/${user?.id}`);
            console.log(res.status)
            if (res.ok) {
                const data = await res.json();
                setIsAdmin(data.roleId === 3 || data.roleId === 4);
            } else {
                setIsAdmin(false);
            }
        } catch (err) {
            console.error("Erreur lors de la vérification du rôle :", err);
            setIsAdmin(false);
        }
    };


    useEffect(() => {
        if (isLoaded && user) {
            checkRole();
        }
    }, [isLoaded, user]);


    useEffect(() => {
        if (isAdmin === false) {
            (async () => {
                await signOut();
                navigate("/");
            })();
        }
    }, [isAdmin, signOut, navigate]);

    if (!isLoaded) {
        return (
            <div className="p-4 text-gray-500 text-sm">
                Chargement...
            </div>
        );
    }

    if (!isAdmin) return <h1>Vous n'êtes pas administrateur</h1>;

    if (!user) {
        return (
            <nav className="bg-white border-b shadow px-6 py-3 flex justify-between items-center">
                <div className="flex gap-6 items-center">
                    <h1 className="text-xl font-semibold text-gray-800">CUBE 2 GROUPE</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/sign-in"
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                        Connexion
                    </Link>
                </div>
            </nav>
        );
    }

    // if (!isAdmin) return null;

    return (
        <nav className="bg-white border-b shadow px-6 py-3 flex justify-between items-center">
            <div className="flex gap-6 items-center">
                <h1 className="text-xl font-semibold text-gray-800">CUBE 2 GROUPE</h1>
                <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium">
                    Services
                </Link>
                <Link to="/users" className="text-gray-700 hover:text-blue-600 font-medium">
                    Utilisateurs
                </Link>
                <Link to="/logs" className="text-gray-700 hover:text-blue-600 font-medium">
                    Logs
                </Link>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                    {user.username}
                </span>
                <SignOutButton>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                        Déconnexion
                    </button>
                </SignOutButton>
            </div>
        </nav>
    );
}
