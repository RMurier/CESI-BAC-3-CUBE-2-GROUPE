import { useUser } from "@clerk/clerk-react";

export const Home = () => {
  const { user } = useUser();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Bonjour {user?.username}
      </h1>
      <p className="text-gray-600 mb-6">
        Bienvenue sur le back office de <span className="font-semibold">CUBE 2 GROUPE</span>. 
      </p>
    </div>
  );
};
