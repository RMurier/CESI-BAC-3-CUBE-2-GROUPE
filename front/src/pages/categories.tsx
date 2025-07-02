import { useCallback, useEffect, useState } from "react";
import { Category } from "../interfaces/category";
import { useAuthenticatedFetch } from "../hook/useAuthenticatedFetch";

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Category>({
    description: "",
    name: "",
    id: null,
  });
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const [nameFilter, setNameFilter] = useState("");
  const [descFilter, setDescFilter] = useState("");
  const { authenticatedFetch, loading, isLoaded, isSignedIn } =
    useAuthenticatedFetch();

  const fetchCategories = useCallback(async (): Promise<void> => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      return;
    }

    try {
      const data = await authenticatedFetch<Category[]>("/categories");

      if (data?.data) {
        setCategories(data.data);
      } else {
        console.log("⚠️ fetchCategories: Pas de données dans la réponse");
      }
    } catch (error) {
      console.error("💥 fetchCategories: Erreur:", error);
    }
  }, [authenticatedFetch, isLoaded, isSignedIn]);

  useEffect(() => {
    fetchCategories();
  }, [isLoaded]);

  useEffect(() => {
    let filtered = [...categories];

    if (nameFilter.trim()) {
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (descFilter.trim()) {
      filtered = filtered.filter((cat) =>
        cat.description.toLowerCase().includes(descFilter.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  }, [categories, nameFilter, descFilter]);

  const handleAddCategory = async () => {
    if (newCategory.description === "" || newCategory.name === "") {
      setErrorModal(
        "Merci de renseigner toutes les informations de la catégorie."
      );
      return;
    } else {
      setErrorModal(null);
    }

    const res = await authenticatedFetch(`/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategory.name,
        description: newCategory.description,
      }),
    });

    if (res?.data) {
      await fetchCategories();
      setNewCategory({ description: "", name: "", id: null });
      setShowModal(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await authenticatedFetch(`/categories/${id}`, {
      method: "DELETE",
    });

    if (res?.message === "Catégorie supprimée avec succès.") {
      await fetchCategories();
    } else {
      const errorData = res?.message;
      setErrorPopup(errorData || "Une erreur est survenue.");
      setTimeout(() => setErrorPopup(null), 5000);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory) return;
    const res = await authenticatedFetch(`/categories/${editCategory.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editCategory.name,
        description: editCategory.description,
      }),
    });

    if (res?.success) {
      setEditCategory(null);
      await fetchCategories();
    } else {
      setErrorPopup(res?.message || "Erreur lors de la màj");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500">Chargement des catégories...</p>
    );
  }
  return (
    <div className="p-6">
      {errorPopup && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorPopup}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Catégories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Ajouter une catégorie
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrer par nom"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Filtrer par description"
          value={descFilter}
          onChange={(e) => setDescFilter(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Nom</th>
            <th className="p-3">Description</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((category) => (
            <tr key={category.id} className="border-t text-sm">
              <td className="p-3">{category.id}</td>
              <td className="p-3">{category.name}</td>
              <td className="p-3">{category.description}</td>
              <td className="p-3 space-x-4">
                <button
                  onClick={() => setEditCategory(category)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id!)}
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
            <h2 className="text-xl font-bold mb-4">Ajouter une catégorie</h2>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nom de la catégorie"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description de la catégorie"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Ajouter
              </button>
            </div>
            {errorModal && (
              <div className="text-red-600 mt-2">{errorModal}</div>
            )}
          </div>
        </div>
      )}

      {editCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Modifier la catégorie</h2>
            <input
              type="text"
              value={editCategory.name}
              onChange={(e) =>
                setEditCategory((prev) => ({ ...prev!, name: e.target.value }))
              }
              placeholder="Nom de la catégorie"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <input
              type="text"
              value={editCategory.description}
              onChange={(e) =>
                setEditCategory((prev) => ({
                  ...prev!,
                  description: e.target.value,
                }))
              }
              placeholder="Description de la catégorie"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditCategory(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateCategory}
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
