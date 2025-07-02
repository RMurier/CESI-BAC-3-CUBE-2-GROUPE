import { useCallback, useEffect, useState } from "react";
import { Ressource } from "../interfaces/ressource";
import { Category } from "../interfaces/category";
import { useAuthenticatedFetch } from "../hook/useAuthenticatedFetch";
import { useAuth } from "@clerk/clerk-react";

export const RessourcesPage = () => {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [filteredRessources, setFilteredRessources] = useState<Ressource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [titleFilter, setTitleFilter] = useState("");
  const [descFilter, setDescFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");

  const [newRessource, setNewRessource] = useState({
    title: "",
    description: "",
    categoryId: 0,
    isActive: true,
    userClerkId: "",
  });
  const { userId } = useAuth();
  const [editRessource, setEditRessource] = useState<Ressource | null>(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const { authenticatedFetch, loading, isLoaded, isSignedIn } =
    useAuthenticatedFetch();

  const fetchData = useCallback(async (): Promise<void> => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      return;
    }

    try {
      const dataCategories = await authenticatedFetch<Category[]>(
        "/categories"
      );
      if (dataCategories?.data) {
        setCategories(dataCategories.data);
      } else {
        console.log("⚠️ fetchCategories: Pas de données dans la réponse");
      }
    } catch (error) {
      console.error("💥 fetchCategories: Erreur:", error);
    }
    try {
      const dataRessource = await authenticatedFetch<Ressource[]>(
        "/ressources"
      );
      if (dataRessource?.success) {
        setRessources(dataRessource.data);
      } else {
        console.log("⚠️ fetchRessources: Pas de données dans la réponse");
      }
    } catch (error) {
      console.error("💥 fetchRessources: Erreur:", error);
    }
  }, [authenticatedFetch, isLoaded, isSignedIn]);

  const handleCreate = async () => {
    if (newRessource.categoryId === 0) {
      alert("Merci de sélectionner une catégorie.");
      return;
    }

    const res = await authenticatedFetch(`/ressources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRessource),
    });
    console.log("OKJAZEOIAZJIEOIAZ : ", res);

    if (res?.success) {
      setNewRessource({
        title: "",
        description: "",
        categoryId: 0,
        isActive: true,
        userClerkId: userId ?? "",
      });
      await fetchData();
      setShowModal(false);
    }
  };

  const handleUpdate = async () => {
    if (!editRessource) return;
    const res = await fetch(`${BASE_URL}/ressources/${editRessource.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editRessource),
    });

    if (res.ok) {
      setEditRessource(null);
      setShowEditModal(false);
      fetchData();
    }
  };

  const deleteRessource = async (id: string) => {
    const res = await fetch(`${BASE_URL}/ressources/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoaded]);

  useEffect(() => {
    let filtered = [...ressources];

    if (titleFilter.trim()) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (descFilter.trim()) {
      filtered = filtered.filter((r) =>
        r.description.toLowerCase().includes(descFilter.toLowerCase())
      );
    }

    if (categoryFilter !== "") {
      filtered = filtered.filter(
        (r) => r.categoryId === Number(categoryFilter)
      );
    }

    setFilteredRessources(filtered);
  }, [ressources, titleFilter, descFilter, categoryFilter]);

  if (loading) {
    return <p className="text-center text-gray-500">Chargement...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ressources</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Ajouter une ressource
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrer par titre"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Filtrer par description"
          value={descFilter}
          onChange={(e) => setDescFilter(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value ? Number(e.target.value) : "")
          }
          className="border rounded px-3 py-2"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id!} value={cat.id!}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
          <tr>
            <th className="p-3">Titre</th>
            <th className="p-3">Description</th>
            <th className="p-3">Catégorie</th>
            <th className="p-3">Créée le</th>
            <th className="p-3">Statut</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRessources.map((r) => (
            <tr key={r.id} className="border-t text-sm">
              <td className="p-3">{r.title}</td>
              <td className="p-3">{r.description}</td>
              <td className="p-3">{r.category?.name ?? "—"}</td>
              <td className="p-3">
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
              <td>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    disabled
                    type="checkbox"
                    checked={r.isActive}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                </label>
              </td>
              <td className="flex gap-4 p-3">
                <button
                  onClick={() => {
                    setEditRessource(r);
                    setShowEditModal(true);
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteRessource(r.id!)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Ajouter une ressource</h2>

            <input
              type="text"
              placeholder="Titre"
              value={newRessource.title}
              onChange={(e) =>
                setNewRessource((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <textarea
              placeholder="Description"
              value={newRessource.description}
              onChange={(e) =>
                setNewRessource((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <label className="relative inline-flex items-center cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={newRessource.isActive}
                onChange={(e) =>
                  setNewRessource((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
              <p className="ml-2">
                {newRessource.isActive ? "Actif" : "Inactif"}
              </p>
            </label>

            <select
              value={newRessource.categoryId ?? 0}
              onChange={(e) =>
                setNewRessource((prev) => ({
                  ...prev,
                  categoryId: Number(e.target.value),
                }))
              }
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value={0} disabled>
                Choisir une catégorie
              </option>
              {categories
                .filter((cat) => cat.id !== null)
                .map((cat) => (
                  <option key={cat.id!} value={cat.id!}>
                    {cat.name}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editRessource && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Modifier la ressource</h2>

            <input
              type="text"
              value={editRessource.title}
              onChange={(e) =>
                setEditRessource((prev) => ({
                  ...prev!,
                  title: e.target.value,
                }))
              }
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Titre"
            />

            <textarea
              value={editRessource.description}
              onChange={(e) =>
                setEditRessource((prev) => ({
                  ...prev!,
                  description: e.target.value,
                }))
              }
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Description"
            />

            <label className="relative inline-flex items-center cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={editRessource.isActive}
                onChange={(e) =>
                  setEditRessource((prev) => ({
                    ...prev!,
                    isActive: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
              <p className="ml-2">
                {editRessource.isActive ? "Actif" : "Inactif"}
              </p>
            </label>

            <select
              value={editRessource.categoryId ?? 0}
              onChange={(e) =>
                setEditRessource((prev) => ({
                  ...prev!,
                  categoryId: Number(e.target.value),
                }))
              }
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value={0} disabled>
                Choisir une catégorie
              </option>
              {categories
                .filter((cat) => cat.id !== null)
                .map((cat) => (
                  <option key={cat.id!} value={cat.id!}>
                    {cat.name}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
