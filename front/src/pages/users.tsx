import { useEffect, useState } from "react";
import { Role } from "../interfaces/role";
import { User } from "../interfaces/user";
import { useRoleStore } from "../stores/roleStore";

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | string>("");

  const { isSuperAdmin } = useRoleStore();


  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/users`);
    const data = await res.json();
    setUsers(data.data);
    setLoading(false);
  };

  const fetchRoles = async () => {
    const res = await fetch(`${BASE_URL}/roles`);
    const data = await res.json();
    setRoles(data);
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    if (nameFilter.trim()) {
      filtered = filtered.filter((u) =>
        u.name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (emailFilter.trim()) {
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    if (roleFilter !== "") {
      filtered = filtered.filter((u) => u.roleId === Number(roleFilter));
    }

    setFilteredUsers(filtered);
  }, [users, nameFilter, emailFilter, roleFilter]);

  const handleEditUser = async () => {
    if (!selectedUser) return;

    const res = await fetch(`${BASE_URL}/users/role/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: selectedUser.roleId }),
    });

    const statusRes = await fetch(`${BASE_URL}/users/desactivate/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActivated: selectedUser.isActivated }),
    });

    if (res.ok && statusRes.ok) {
      setEditModalOpen(false);
      fetchUsers();
    } else {
      console.error("Erreur lors de la mise à jour");
    }
  };

  const deleteUser = async (userId: number) => {
    await fetch(`${BASE_URL}/users/${userId}`, { method: "DELETE" });
    fetchUsers();
  };

  if (loading) {
    return <p className="text-center text-gray-500">Chargement des utilisateurs...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Utilisateurs</h1>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrer par nom"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Filtrer par email"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value ? Number(e.target.value) : "")}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Tous les rôles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
          <tr>
            <th className="p-3">Id</th>
            <th className="p-3">Nom</th>
            <th className="p-3">Email</th>
            <th className="p-3">Rôle</th>
            <th className="p-3">Actif ?</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="border-t text-sm">
              <td className="p-3">{user.id ?? "—"}</td>
              <td className="p-3">{user.name ?? "—"}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role?.name}</td>
              <td>
                <label className="relative inline-flex items-center cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={user.isActivated}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                </label>
              </td>
              <td className="p-3 text-center space-x-4">
                {isSuperAdmin && (

                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Modifier
                  </button>
                )}
                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Modifier l'utilisateur</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Rôle</label>
              <select
                value={selectedUser.roleId}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev!, roleId: Number(e.target.value) }))
                }
                className="w-full border rounded px-3 py-2"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Statut</label>
              <label className="relative inline-flex items-center cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={selectedUser.isActivated}
                  onChange={(e) =>
                    setSelectedUser((prev) => ({ ...prev!, isActivated: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                <p className="ml-2">{selectedUser.isActivated ? "Actif" : "Inactif"}</p>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleEditUser}
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
