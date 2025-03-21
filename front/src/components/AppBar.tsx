import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function AppBar() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        const res = await fetch(`/api/roles/${user.id}`);
        // if(res?.ok){
        //     const data = await res.json();
        //     setIsAdmin(data.isAdmin);
        // }
      }
    };
  }, []);


//   if (!isAdmin) return null;

  return (
    <nav className="bg-white border-b shadow px-6 py-3 flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
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
        <span className="text-sm text-gray-600">{user?.emailAddresses[0]?.emailAddress}</span>
        <SignOutButton>
          <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
            Déconnexion
          </button>
        </SignOutButton>
      </div>
    </nav>
  );
}
